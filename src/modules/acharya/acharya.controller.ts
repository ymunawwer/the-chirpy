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

export const bulkExecute = catchAsync(async (req: Request, res: Response) => {
  const { agentId, customer } = req.body as {
    agentId: string;
    customer: { to: string; data?: string }[];
  };

  const producer = await getAcharyaProducer();

  // If Kafka is not configured, fall back to direct sequential execution
  if (!producer) {
    const results = [] as { to: string; logId: string; status: string }[];

    for (const c of customer) {
      console.log(c);
      const result = await acharyaService.executeWorkflow({
        to: c.to,
        data: c.data,
        agentId,
      } as any);
      results.push({ to: c.to, logId: String(result.log._id), status: result.log.status });
    }

    return res.status(httpStatus.OK).json({
      message: 'acharya_bulk_workflow_executed',
      data: results,
    });
  }

  const logEntries: { to: string; logId: string }[] = [];
  const messages = [] as { value: string }[];

  for (const c of customer) {
    const pendingLog = await acharyaService.createPendingExecutionLog({
      to: c.to,
      data: c.data,
      agentId,
    } as any);

    logEntries.push({ to: c.to, logId: String(pendingLog._id) });

    messages.push({
      value: JSON.stringify({
        to: c.to,
        data: c.data,
        agentId,
        logId: String(pendingLog._id),
      }),
    });
  }

  await producer.send({
    topic: acharyaExecuteTopic,
    messages,
  });

  return res.status(httpStatus.ACCEPTED).json({
    message: 'acharya_bulk_workflow_queued',
    data: logEntries,
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

