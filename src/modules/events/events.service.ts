import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Event, { IEvent } from './events.model';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';

export interface EventContactInput {
  contactId?: string;
  contactName?: string;
  contactNumbers?: string[];
}

export interface CreateEventBody {
  contacts?: EventContactInput[];
  agentId: string;
  scheduleCron?: string;
  scheduleAt?: Date;
  repetition?: string;
  condition?: string;
  status?: string;
  description?: string;
  eventName: string;
  recurrent?: boolean;
  expiry?: Date;
  purpose?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
}

export type UpdateEventBody = Partial<CreateEventBody>;

export const createEvent = async (body: CreateEventBody): Promise<IEvent> => {
  const payload: any = { ...body };

  if (body.contacts && Array.isArray(body.contacts)) {
    payload.contacts = body.contacts.map((c) => ({
      ...c,
      contactId: c.contactId ? new mongoose.Types.ObjectId(c.contactId) : undefined,
    }));
  }
  return Event.create(payload);
};

export const queryEvents = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const events = await (Event as any).paginate
    ? (Event as any).paginate(filter, options)
    : {
        results: await Event.find(filter)
          .limit((options.limit as number) || 10)
          .exec(),
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 1,
        totalResults: 0,
      };
  return events;
};

export const getEventById = async (id: mongoose.Types.ObjectId): Promise<IEvent | null> => {
  return Event.findById(id);
};

export const updateEventById = async (
  eventId: mongoose.Types.ObjectId,
  updateBody: UpdateEventBody
): Promise<IEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const payload: any = { ...updateBody };
  if (updateBody.contacts && Array.isArray(updateBody.contacts)) {
    payload.contacts = updateBody.contacts.map((c) => ({
      ...c,
      contactId: c.contactId ? new mongoose.Types.ObjectId(c.contactId) : undefined,
    }));
  }

  Object.assign(event, payload);
  await event.save();
  return event;
};

export const deleteEventById = async (eventId: mongoose.Types.ObjectId): Promise<IEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  await event.deleteOne();
  return event;
};
