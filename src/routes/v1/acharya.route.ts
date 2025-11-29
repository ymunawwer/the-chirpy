import express from 'express';
import * as acharyaController from '../../modules/acharya/acharya.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Acharya
 *   description: Acharya workflow APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AcharyaExecuteRequest:
 *       type: object
 *       required:
 *         - to
 *         - agentId
 *       properties:
 *         to:
 *           type: string
 *           description: Destination identifier (e.g. phone number)
 *         data:
 *           type: string
 *           description: Optional payload string
 *         agentId:
 *           type: string
 *           description: Workflow ID to execute
 *     AcharyaWorkflow:
 *       type: object
 *       description: Generic Acharya workflow representation (proxied from Acharya Engine)
 *     AcharyaWorkflowList:
 *       type: object
 *       description: Paginated list of workflows
 *     AcharyaCreateWorkflowRequest:
 *       type: object
 *       required:
 *         - name
 *         - steps
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         steps:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties: true
 */

/**
 * @swagger
 * /v1/acharya/execute:
 *   post:
 *     summary: Execute an Acharya workflow and log the request
 *     tags: [Acharya]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcharyaExecuteRequest'
 *     responses:
 *       200:
 *         description: Workflow executed successfully
 *       500:
 *         description: Acharya workflow configuration missing or execution failed
 */
router.post('/execute', acharyaController.execute);

/**
 * @swagger
 * /v1/acharya/workflows/{workflowId}:
 *   get:
 *     summary: Get a workflow by ID
 *     tags: [Acharya]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow retrieved
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 */
router.get('/workflows/:workflowId', acharyaController.getWorkflow);

/**
 * @swagger
 * /v1/acharya/workflows/{workflowId}/publish:
 *   post:
 *     summary: Publish a workflow
 *     tags: [Acharya]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow published
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 */
router.post('/workflows/:workflowId/publish', acharyaController.publishWorkflow);

/**
 * @swagger
 * /v1/acharya/workflows/{workflowId}:
 *   put:
 *     summary: Update a workflow
 *     tags: [Acharya]
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcharyaCreateWorkflowRequest'
 *     responses:
 *       200:
 *         description: Workflow updated
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 */
router.put('/workflows/:workflowId', acharyaController.updateWorkflow);

/**
 * @swagger
 * /v1/acharya/workflows/cards:
 *   get:
 *     summary: List workflow cards
 *     tags: [Acharya]
 *     responses:
 *       200:
 *         description: Workflow cards retrieved
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 */
router.get('/workflows/cards', acharyaController.listWorkflowCards);

/**
 * @swagger
 * /v1/acharya/workflows:
 *   get:
 *     summary: List workflows
 *     tags: [Acharya]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page size
 *     responses:
 *       200:
 *         description: Workflows retrieved
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 *   post:
 *     summary: Create a workflow
 *     tags: [Acharya]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcharyaCreateWorkflowRequest'
 *     responses:
 *       201:
 *         description: Workflow created
 *       500:
 *         description: Acharya workflow configuration missing or request failed
 */
router.get('/workflows', acharyaController.listWorkflows);
router.post('/workflows', acharyaController.createWorkflow);

export default router;
