import mongoose from 'mongoose';
import CallLog, { ICallLog, CallStatus } from './callLog.model';
import { IOptions, QueryResult } from '../paginate/paginate';

export interface CreateCallLogBody {
  eventId?: string;
  contactId?: string;
  agentId?: string;
  to: string;
  status?: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  durationMs?: number;
  lastError?: string;
  externalResponse?: Record<string, any>;
  meta?: Record<string, any>;
}

export const createCallLog = async (body: CreateCallLogBody): Promise<ICallLog> => {
  const payload: any = {
    ...body,
  };

  if (body.eventId) {
    payload.eventId = new mongoose.Types.ObjectId(body.eventId);
  }
  if (body.contactId) {
    payload.contactId = new mongoose.Types.ObjectId(body.contactId);
  }

  return CallLog.create(payload);
};

export const queryCallLogs = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const normalizedFilter: Record<string, any> = { ...filter };

  if (normalizedFilter["eventId"] && typeof normalizedFilter["eventId"] === 'string') {
    normalizedFilter["eventId"] = new mongoose.Types.ObjectId(normalizedFilter["eventId"]);
  }

  if (normalizedFilter["contactId"] && typeof normalizedFilter["contactId"] === 'string') {
    normalizedFilter["contactId"] = new mongoose.Types.ObjectId(normalizedFilter["contactId"]);
  }

  const logs = await (CallLog as any).paginate
    ? (CallLog as any).paginate(normalizedFilter, options)
    : {
        results: await CallLog.find(normalizedFilter)
          .limit((options.limit as number) || 10)
          .exec(),
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 1,
        totalResults: 0,
      };

  return logs;
};

export const markCallRunning = async (id: mongoose.Types.ObjectId): Promise<ICallLog | null> => {
  return CallLog.findByIdAndUpdate(
    id,
    { status: 'running', startedAt: new Date() },
    { new: true }
  ).exec();
};

export const markCallCompleted = async (
  id: mongoose.Types.ObjectId,
  externalResponse?: Record<string, any>
): Promise<ICallLog | null> => {
  const now = new Date();
  const log = await CallLog.findById(id).exec();
  if (!log) return null;

  const startedAt = log.startedAt || now;
  const durationMs = now.getTime() - startedAt.getTime();

  log.status = 'completed';
  log.endedAt = now;
  log.durationMs = durationMs;
  if (externalResponse !== undefined) {
    log.externalResponse = externalResponse;
  }
  await log.save();
  return log;
};

export const markCallFailed = async (
  id: mongoose.Types.ObjectId,
  error: Error
): Promise<ICallLog | null> => {
  const now = new Date();
  const log = await CallLog.findById(id).exec();
  if (!log) return null;

  const startedAt = log.startedAt || now;
  const durationMs = now.getTime() - startedAt.getTime();

  log.status = 'failed';
  log.endedAt = now;
  log.durationMs = durationMs;
  log.lastError = error.message;
  await log.save();
  return log;
};
