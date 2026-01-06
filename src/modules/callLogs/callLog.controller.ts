import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as callLogService from './callLog.service';

export const listCallLogs = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['eventId', 'contactId', 'agentId', 'status']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await callLogService.queryCallLogs(filter, options);
  return res.status(httpStatus.OK).json({ message: 'call_logs_retrieved', data: result });
});
