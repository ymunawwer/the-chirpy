import express from 'express';
import * as callLogController from '../../modules/callLogs/callLog.controller';

const router = express.Router();

router.get('/', callLogController.listCallLogs);

export default router;
