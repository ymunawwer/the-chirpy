import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as licenseService from './licence.service';

// ----- RESTful style controllers -----

export const create = catchAsync(async (req: Request, res: Response) => {
  const license = await licenseService.createLicense(
    req.body.userId,
    req.body.expirationDate,
    req.body.licenseType,
    req.body.features,
    req.body.createdBy,
    req.body.updatedBy
  );
  return res.status(httpStatus.CREATED).json({ message: 'license_created', data: license });
});

export const createForAuth = catchAsync(async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser?._id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
  const license = await licenseService.createLicense(
    String(authUser._id),
    req.body.expirationDate,
    req.body.licenseType,
    req.body.features,
    req.body.createdBy,
    req.body.updatedBy
  );
  return res.status(httpStatus.CREATED).json({ message: 'license_created', data: license });
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['key', 'isActive', 'userId']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await licenseService.queryLicenses(filter, options);
  return res.status(httpStatus.OK).json({ message: 'licenses_retrieved', data: result });
});

export const get = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['licenseId'] === 'string') {
    const license = await licenseService.getLicenseById(new mongoose.Types.ObjectId(req.params['licenseId']));
    if (!license) throw new ApiError(httpStatus.NOT_FOUND, 'License not found');
    return res.status(httpStatus.OK).json({ message: 'license_retrieved', data: license });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid license ID');
});

export const getByUser = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['userId'] === 'string') {
    const license = await licenseService.getLicenseByUserId(new mongoose.Types.ObjectId(req.params['userId']));
    if (!license) throw new ApiError(httpStatus.NOT_FOUND, 'License not found for user');
    return res.status(httpStatus.OK).json({ message: 'license_retrieved', data: license });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
});

export const getActive = catchAsync(async (_req: Request, res: Response) => {
  const license = await licenseService.getActiveLicense();
  if (!license) throw new ApiError(httpStatus.NOT_FOUND, 'No active license found');
  return res.status(httpStatus.OK).json({ message: 'active_license_retrieved', data: license });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['licenseId'] === 'string') {
    const license = await licenseService.updateLicenseById(new mongoose.Types.ObjectId(req.params['licenseId']), req.body);
    return res.status(httpStatus.OK).json({ message: 'license_updated', data: license });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid license ID');
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['licenseId'] === 'string') {
    await licenseService.deleteLicenseById(new mongoose.Types.ObjectId(req.params['licenseId']));
    return res.status(httpStatus.NO_CONTENT).json({ message: 'license_deleted' });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid license ID');
});

export const activate = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['licenseId'] === 'string') {
    const license = await licenseService.activateLicenseById(new mongoose.Types.ObjectId(req.params['licenseId']));
    return res.status(httpStatus.OK).json({ message: 'license_activated', data: license });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid license ID');
});

export const deactivate = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['licenseId'] === 'string') {
    const license = await licenseService.deactivateLicenseById(new mongoose.Types.ObjectId(req.params['licenseId']));
    return res.status(httpStatus.OK).json({ message: 'license_deactivated', data: license });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid license ID');
});

// ----- Keep existing key-based endpoints for backward compatibility -----

export const createLicense = async (req: Request, res: Response): Promise<void> => {
  const { userId, expirationDate, licenseType, features, createdBy, updatedBy } = req.body;
  try {
    const license = await licenseService.createLicense(userId, expirationDate, licenseType, features, createdBy, updatedBy);
    res.status(201).json({ message: 'License key created', key: license.key });
  } catch (err) {
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
    (req as any).license = license;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Error validating license key' });
  }
};
