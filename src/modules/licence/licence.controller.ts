import { Request, Response } from 'express';
import * as licenseService from './licence.service';


export const createLicense = async (req: Request, res: Response): Promise<void> => {
    const { userId, expirationDate, licenseType, features, createdBy, updatedBy } = req.body;
console.log(req.body.features)
    try {
        const license = await licenseService.createLicense(userId, expirationDate, licenseType, features, createdBy, updatedBy);
        res.status(201).json({ message: 'License key created', key: license.key });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'Error creating license key' });
    }
};

export const activateLicense = async (req: Request, res: Response): Promise<void> => {
    const { userId, expirationDate, licenseType, features, createdBy, updatedBy } = req.body;

    try {
        const license = await licenseService.activateLicense(userId, expirationDate, licenseType, features, createdBy, updatedBy);
        res.status(201).json({ message: 'License key activated', key: license.key });
    } catch (err) {
        res.status(400).json({ error: 'Error activating license key' });
    }
};

export const renewLicense = async (req: Request, res: Response): Promise<void> => {
    const { key, newExpirationDate } = req.body;

    try {
        const license = await licenseService.renewLicense(key, newExpirationDate);
        if (!license) {
            res.status(400).json({ error: 'License key not found or inactive' });
            return;
        }
        res.status(200).json({ message: 'License key renewed' });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: 'Error renewing license key' });
    }
};

export const revokeLicense = async (req: Request, res: Response): Promise<void> => {
    const { key } = req.body;

    try {
        const license = await licenseService.revokeLicense(key);
        if (!license) {
            res.status(400).json({ error: 'License key not found or already inactive' });
            return;
        }
        res.status(200).json({ message: 'License key revoked' });
    } catch (err) {
        res.status(400).json({ error: 'Error revoking license key' });
    }
};

export const validateLicenseKey = async (req: Request, res: Response, next: Function): Promise<void> => {
    const licenseKey = req.headers['x-license-key'] as string;

    if (!licenseKey) {
        res.status(401).json({ error: 'License key is missing' });
        return;
    }

    try {
        const license = await licenseService.validateLicenseKey(licenseKey);
        if (!license) {
            res.status(401).json({ error: 'Invalid, expired, or inactive license key' });
            return;
        }
        req.body.license = license;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Error validating license key' });
    }
};
