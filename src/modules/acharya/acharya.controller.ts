import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import * as acharyaService from './acharya.service';

export const execute = catchAsync(async (req: Request, res: Response) => {
  const { to, data, agentId } = req.body as { to: string; data?: string; agentId: string };

  const result = await acharyaService.executeWorkflow({ to, data, agentId } as any);

  return res.status(httpStatus.OK).json({
    message: 'acharya_workflow_executed',
    logId: result.log._id,
    externalResponse: result.externalResponse,
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

