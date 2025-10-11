import express from 'express';
import * as licenseController from '../../modules/licence/licence.controller';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = express.Router();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'License API',
            version: '1.0.0',
            description: 'API for managing license keys',
            contact: {
                name: 'Your Name',
                email: 'your-email@example.com'
            },
            servers: [{
                url: 'http://localhost:3000',
                description: 'Local server'
            }]
        }
    },
    apis: ['./src/routes/*.ts']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     License:
 *       type: object
 *       required:
 *         - key
 *         - userId
 *         - expirationDate
 *         - licenseType
 *         - features
 *         - createdBy
 *         - updatedBy
 *       properties:
 *         key:
 *           type: string
 *           description: The license key
 *         userId:
 *           type: number
 *           description: ID of the user
 *         creationDate:
 *           type: string
 *           format: date-time
 *           description: Date of license creation
 *         expirationDate:
 *           type: string
 *           format: date
 *           description: Date of license expiration
 *         licenseType:
 *           type: string
 *           description: Type of the license
 *         features:
 *           type: object
 *           description: Features included in the license
 *         isActive:
 *           type: boolean
 *           description: Status of the license
 *         createdBy:
 *           type: string
 *           description: Creator of the license
 *         updatedBy:
 *           type: string
 *           description: Last updater of the license
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/license/create:
 *   post:
 *     summary: Create a new license key
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               licenseType:
 *                 type: string
 *               features:
 *                 type: object
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: License key created
 *       400:
 *         description: Error creating license key
 */




/**
 * @swagger
 * /api/license/activate:
 *   post:
 *     summary: Activate a new license key
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *               expirationDate:
 *                 type: string
 *                 format: date
 *               licenseType:
 *                 type: string
 *               features:
 *                 type: object
 *               createdBy:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: License key activated
 *       400:
 *         description: Error activating license key
 */

/**
 * @swagger
 * /api/license/renew:
 *   post:
 *     summary: Renew an existing license key
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               newExpirationDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: License key renewed
 *       400:
 *         description: Error renewing license key
 */

/**
 * @swagger
 * /api/license/revoke:
 *   post:
 *     summary: Revoke an existing license key
 *     tags: [License]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: License key revoked
 *       400:
 *         description: Error revoking license key
 */

/**
 * @swagger
 * /api/license/validate:
 *   get:
 *     summary: Validate a license key
 *     tags: [License]
 *     parameters:
 *       - in: header
 *         name: x-license-key
 *         schema:
 *           type: string
 *         required: true
 *         description: The license key
 *     responses:
 *       200:
 *         description: License key is valid
 *       401:
 *         description: Invalid, expired, or inactive license key
 *       400:
 *         description: Error validating license key
 */
router.post('/create', licenseController.createLicense);
router.post('/activate', licenseController.activateLicense);
router.post('/renew', licenseController.renewLicense);
router.post('/revoke', licenseController.revokeLicense);
router.get('/validate', licenseController.validateLicenseKey, (req, res) => {
    res.status(200).json({ message: 'License key is valid', license: req.body.license });
});

export default router;
