import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as acharyaService from './acharya.service';
import { getAcharyaProducer, acharyaExecuteTopic } from './acharya.kafka';

export const execute = catchAsync(async (req: Request, res: Response) => {
  const { to, data, agentId } = req.body as { to: string; data?: string; agentId: string };
  const producer = await getAcharyaProducer();

  if (!producer) {
    const result = await acharyaService.executeWorkflow({ to, data, agentId } as any);
    return res.status(httpStatus.OK).json({
      message: 'acharya_workflow_executed',
      logId: result.log._id,
      externalResponse: result.externalResponse,
    });
  }

  const pendingLog = await acharyaService.createPendingExecutionLog({ to, data, agentId } as any);

  const payload = { to, data, agentId, logId: String(pendingLog._id) };

  await producer.send({
    topic: acharyaExecuteTopic,
    messages: [{ value: JSON.stringify(payload) }],
  });

  return res.status(httpStatus.ACCEPTED).json({
    message: 'acharya_workflow_queued',
    logId: pendingLog._id,
  });
});

export const getWorkflow = catchAsync(async (req: Request, res: Response) => {
  const { workflowId } = req.params as { workflowId: string };
  const data = await acharyaService.getWorkflow(workflowId);
  return res.status(httpStatus.OK).json({ message: 'acharya_workflow_retrieved', data });
});

export const publishWorkflow = catchAsync(async (req: Request, res: Response) => {
  const { workflowId } = req.params as { workflowId: string };
  const data = await acharyaService.publishWorkflow(workflowId);
  return res.status(httpStatus.OK).json({ message: 'acharya_workflow_published', data });
});

export const updateWorkflow = catchAsync(async (req: Request, res: Response) => {
  const { workflowId } = req.params as { workflowId: string };
  const data = await acharyaService.updateWorkflow(workflowId, req.body);
  return res.status(httpStatus.OK).json({ message: 'acharya_workflow_updated', data });
});

export const listWorkflowCards = catchAsync(async (_req: Request, res: Response) => {
  const data = await acharyaService.listWorkflowCards();
  return res.status(httpStatus.OK).json({ message: 'acharya_workflow_cards_retrieved', data });
});

export const listWorkflows = catchAsync(async (req: Request, res: Response) => {
  const page = req.query['page'] ? Number(req.query['page']) : undefined;
  const limit = req.query['limit'] ? Number(req.query['limit']) : undefined;
  const data = await acharyaService.listWorkflows(page, limit);
  return res.status(httpStatus.OK).json({ message: 'acharya_workflows_retrieved', data });
});

export const createWorkflow = catchAsync(async (req: Request, res: Response) => {
  const data = await acharyaService.createWorkflow(req.body);
  return res.status(httpStatus.CREATED).json({ message: 'acharya_workflow_created', data });
});

export const getExecutionStatus = catchAsync(async (req: Request, res: Response) => {
  const { logId } = req.params as { logId: string };
  const log = await acharyaService.getExecutionStatusById(logId);

  if (!log) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'acharya_execution_not_found' });
  }

  return res.status(httpStatus.OK).json({
    message: 'acharya_execution_status',
    data: {
      id: log._id,
      status: log.status,
      responseStatus: log.responseStatus,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    },
  });
});

