import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import AcharyaLog, { IAcharyaLog } from './acharya.model';

const ACHARYA_WORKFLOW_URL = process.env['ACHARYA_WORKFLOW_URL'];
const ACHARYA_WORKFLOW_LICENCE = process.env['ACHARYA_WORKFLOW_LICENCE'];

if (!ACHARYA_WORKFLOW_URL || !ACHARYA_WORKFLOW_LICENCE) {
  // eslint-disable-next-line no-console
  console.warn('Acharya workflow env vars (ACHARYA_WORKFLOW_URL/ACHARYA_WORKFLOW_LICENCE) are not set.');
}

export interface ExecuteWorkflowParams {
  to: string;
  data?: string;
  agentId: string;
  logId?: string;
}

export interface ExecuteWorkflowResult {
  log: IAcharyaLog;
  externalResponse: any;
}

export const executeWorkflow = async ({ to, data = '', agentId, logId }: ExecuteWorkflowParams): Promise<ExecuteWorkflowResult> => {
  if (!ACHARYA_WORKFLOW_URL || !ACHARYA_WORKFLOW_LICENCE || !agentId) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Acharya workflow configuration missing');
  }

  const URL = `${ACHARYA_WORKFLOW_URL}/workflows/${agentId}/execute`;

  const payload = {
    payload: {
      to,
      data,
    },
  };

  let log: IAcharyaLog;

  if (logId) {
    const existing = await AcharyaLog.findById(logId);
    if (existing) {
      existing.payload = payload as any;
      existing.status = 'pending';
      await existing.save();
      log = existing;
    } else {
      log = await AcharyaLog.create({
        to,
        data,
        payload,
        status: 'pending',
      });
    }
  } else {
    log = await AcharyaLog.create({
      to,
      data,
      payload,
      status: 'pending',
    });
  }

  try {
    const response = await axios.post(URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': ACHARYA_WORKFLOW_LICENCE,
      },
      timeout: 15000,
    });

    log.status = 'success';
    log.responseStatus = response.status;
    log.responseBody = response.data;
    await log.save();

    return { log, externalResponse: response.data };
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data || error?.message || 'Acharya workflow call failed';

    log.status = 'failed';
    log.responseStatus = status;
    log.errorMessage = typeof message === 'string' ? message : JSON.stringify(message);
    await log.save();

    throw new ApiError(status || httpStatus.BAD_GATEWAY, 'Failed to execute Acharya workflow');
  }
};

export const createPendingExecutionLog = async ({ to, data = '', agentId }: ExecuteWorkflowParams): Promise<IAcharyaLog> => {
  const payload = {
    payload: {
      to,
      data,
      agentId,
    },
  };

  const log = await AcharyaLog.create({
    to,
    data,
    payload,
    status: 'pending',
  });

  return log;
};

export const getExecutionStatusById = async (logId: string): Promise<IAcharyaLog | null> => {
  return AcharyaLog.findById(logId);
};


// -------- Generic workflow wrappers (no DB logging) --------

const getAxiosConfig = () => {
  if (!ACHARYA_WORKFLOW_URL || !ACHARYA_WORKFLOW_LICENCE) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Acharya workflow configuration missing');
  }

  return {
    baseURL: `${ACHARYA_WORKFLOW_URL}/workflows`,
    headers: {
      'Content-Type': 'application/json',
      'x-license-key': ACHARYA_WORKFLOW_LICENCE,
    },
    timeout: 15000,
  } as const;
};

export const getWorkflow = async (workflowId: string) => {
  const config = getAxiosConfig();
  const url = `/${workflowId}`; // GET $BASE_URL/$WORKFLOW_ID
  const res = await axios.get(url, config);
  return res.data;
};

export const publishWorkflow = async (workflowId: string) => {
  const config = getAxiosConfig();
  const url = `/${workflowId}/publish`; // POST $BASE_URL/$WORKFLOW_ID/publish
  const res = await axios.post(url, undefined, config);
  return res.data;
};

export interface UpdateWorkflowBody {
  name?: string;
  description?: string;
  steps?: any[];
}

export const updateWorkflow = async (workflowId: string, body: UpdateWorkflowBody) => {
  const config = getAxiosConfig();
  const url = `/${workflowId}`; // PUT $BASE_URL/$WORKFLOW_ID
  const res = await axios.put(url, body, config);
  return res.data;
};

export const listWorkflowCards = async () => {
  const config = getAxiosConfig();
  const url = `/cards`; // GET $BASE_URL/cards
  const res = await axios.get(url, config);
  return res.data;
};

export const listWorkflows = async (page?: number, limit?: number) => {
  const config = getAxiosConfig();
  const params: Record<string, any> = {};
  if (page !== undefined) params['page'] = page;
  if (limit !== undefined) params['limit'] = limit;

  const res = await axios.get('/', { ...config, params }); // GET $BASE_URL?page=1&limit=20
  return res.data;
};

export interface CreateWorkflowBody {
  name: string;
  description?: string;
  steps: any[];
}

export const createWorkflow = async (body: CreateWorkflowBody) => {
  const config = getAxiosConfig();
  const res = await axios.post('/', body, config); // POST $BASE_URL
  return res.data;
};

