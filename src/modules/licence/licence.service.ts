import mongoose from 'mongoose';
import License, { ILicense } from './licence.model';
import crypto from 'crypto';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import { IOptions, QueryResult } from '../paginate/paginate';

export const generateLicenseKey = (): string => {
    return crypto.randomBytes(8).toString('hex').match(/.{1,4}/g)!.join('-');
};


export const createLicense = async (
    userId: string,
    expirationDate: Date,
    licenseType: string,
    features: Record<string, any>,
    createdBy: string,
    updatedBy: string
): Promise<ILicense> => {
    const key = generateLicenseKey();
    const meta = { licenseType, features, createdBy, updatedBy };
    const license = new License({ key, userId, expiresAt: expirationDate, meta });
    return await license.save();
};



export const activateLicense = async (
    userId: number,
    expirationDate: Date,
    licenseType: string,
    features: Record<string, any>,
    createdBy: string,
    updatedBy: string
): Promise<ILicense> => {
    const key = generateLicenseKey();
    const meta = { licenseType, features, createdBy, updatedBy };
    const license = new License({ key, userId, expiresAt: expirationDate, meta });
    return await license.save();
};

export const renewLicense = async (key: string, newExpirationDate: Date): Promise<ILicense | null> => {
    return await License.findOneAndUpdate(
        { key, isActive: true },
        { expiresAt: newExpirationDate },
        { new: true }
    );
};

export const revokeLicense = async (key: string): Promise<ILicense | null> => {
    return await License.findOneAndUpdate(
        { key, isActive: true },
        { isActive: false },
        { new: true }
    );
};

export const validateLicenseKey = async (key: string): Promise<ILicense | null> => {
    const license = await License.findOne({ key, isActive: true });
    if (!license || (license as any).expiresAt && new Date((license as any).expiresAt) < new Date()) {
        return null;
    }
    return license;
};

// ----- Added: RESTful utilities mirrored from modules/license -----

export const queryLicenses = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const licenses = await (License as any).paginate(filter, options);
  return licenses;
};

export const getLicenseById = async (id: mongoose.Types.ObjectId): Promise<ILicense | null> => {
  return License.findById(id);
};

export const getLicenseByUserId = async (userId: mongoose.Types.ObjectId): Promise<ILicense | null> => {
  return (License as any).getByUserId(userId);
};

export const getActiveLicense = async (): Promise<ILicense | null> => {
  return (License as any).getActive();
};

export const updateLicenseById = async (
  licenseId: mongoose.Types.ObjectId,
  updateBody: Record<string, any>
): Promise<ILicense | null> => {
  const license = await getLicenseById(licenseId);
  if (!license) {
    throw new ApiError(httpStatus.NOT_FOUND, 'License not found');
  }
  Object.assign(license, updateBody);
  await (license as any).save();
  return license;
};

export const deleteLicenseById = async (licenseId: mongoose.Types.ObjectId): Promise<ILicense | null> => {
  const license = await getLicenseById(licenseId);
  if (!license) {
    throw new ApiError(httpStatus.NOT_FOUND, 'License not found');
  }
  await (license as any).deleteOne();
  return license;
};

export const activateLicenseById = async (licenseId: mongoose.Types.ObjectId): Promise<ILicense | null> => {
  return updateLicenseById(licenseId, { isActive: true });
};

export const deactivateLicenseById = async (licenseId: mongoose.Types.ObjectId): Promise<ILicense | null> => {
  return updateLicenseById(licenseId, { isActive: false });
};
