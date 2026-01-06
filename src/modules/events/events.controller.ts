import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as eventsService from './events.service';

export const createEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await eventsService.createEvent(req.body);
  return res.status(httpStatus.CREATED).json({ message: 'event_created', data: event });
});

export const listEvents = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, [
    'eventName',
    'status',
    'agentId',
    'contactId',
    'recurrent',
    'purpose',
  ]);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await eventsService.queryEvents(filter, options);
  return res.status(httpStatus.OK).json({ message: 'events_retrieved', data: result });
});

export const getEvent = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['eventId'] === 'string') {
    const event = await eventsService.getEventById(new mongoose.Types.ObjectId(req.params['eventId']));
    if (!event) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
    }
    return res.status(httpStatus.OK).json({ message: 'event_retrieved', data: event });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event ID');
});

export const updateEvent = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['eventId'] === 'string') {
    const event = await eventsService.updateEventById(
      new mongoose.Types.ObjectId(req.params['eventId']),
      req.body
    );
    return res.status(httpStatus.OK).json({ message: 'event_updated', data: event });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event ID');
});

export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['eventId'] === 'string') {
    await eventsService.deleteEventById(new mongoose.Types.ObjectId(req.params['eventId']));
    return res.status(httpStatus.NO_CONTENT).json({ message: 'event_deleted' });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event ID');
});
