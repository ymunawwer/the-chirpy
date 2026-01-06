import mongoose from 'mongoose';
import Event, { IEvent } from '../events/events.model';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import { executeWorkflow } from '../acharya/acharya.service';
import { createCallLog, markCallRunning, markCallCompleted, markCallFailed } from '../callLogs/callLog.service';

/**
 * Event execution service
 *
 * Responsibility:
 * - Find due events based on status/schedule
 * - Execute events by triggering the Acharya workflow for each contact
 * - Update event status accordingly
 */

export interface ExecuteEventOptions {
  /**
   * If true, will execute even if scheduleAt is in the future, as long as status is scheduled/paused
   */
  ignoreSchedule?: boolean;
}

export const findDueEvents = async (now: Date = new Date()): Promise<IEvent[]> => {
  // Basic rule: status = scheduled and scheduleAt <= now (or no scheduleAt set)
  return Event.find({
    status: 'scheduled',
    $or: [{ scheduleAt: { $lte: now } }, { scheduleAt: { $exists: false } }, { scheduleAt: null }],
  }).exec();
};

export const executeEvent = async (
  eventId: mongoose.Types.ObjectId | string,
  options: ExecuteEventOptions = {}
): Promise<IEvent> => {
  const id = typeof eventId === 'string' ? new mongoose.Types.ObjectId(eventId) : eventId;
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  if (event.status !== 'scheduled' && event.status !== 'paused') {
    // Nothing to do if not in an executable state
    return event;
  }

  if (!options.ignoreSchedule && event.scheduleAt && event.scheduleAt.getTime() > Date.now()) {
    // Not yet due
    return event;
  }

  event.status = 'running';
  await event.save();

  try {
    const contacts = event.contacts || [];

    for (const c of contacts) {
      const to = c.contactNumbers && c.contactNumbers.length > 0 ? c.contactNumbers[0] : undefined;
      if (!to) {
        // If there is no number, skip this contact
        continue;
      }

      // Create call log in queued state
      const callLog = await createCallLog({
        eventId: String(event._id),
        ...(c.contactId ? { contactId: String(c.contactId) } : {}),
        agentId: event.agentId,
        to,
        status: 'queued',
        meta: {
          eventName: event.eventName,
          purpose: event.purpose,
        },
      });

      // Mark running
      await markCallRunning(callLog._id as any);

      try {
        const result = await executeWorkflow({
          to,
          data: event.purpose || event.description || '',
          agentId: event.agentId,
        } as any);

        await markCallCompleted(callLog._id as any, result.externalResponse);
      } catch (callErr) {
        await markCallFailed(callLog._id as any, callErr as Error);
        throw callErr;
      }
    }

    // For recurrent events we keep them scheduled; otherwise mark completed
    if (event.recurrent) {
      event.status = 'scheduled';
    } else {
      event.status = 'completed';
    }

    await event.save();
    return event;
  } catch (err) {
    event.status = 'failed';
    await event.save();
    throw err;
  }
};

export const executeDueEvents = async (now: Date = new Date()): Promise<{ success: IEvent[]; failed: { event: IEvent; error: Error }[] }> => {
  const dueEvents = await findDueEvents(now);
  const success: IEvent[] = [];
  const failed: { event: IEvent; error: Error }[] = [];

  for (const e of dueEvents) {
    try {
      const updated = await executeEvent(e._id, { ignoreSchedule: true });
      success.push(updated);
    } catch (err) {
      failed.push({ event: e, error: err as Error });
    }
  }

  return { success, failed };
};
