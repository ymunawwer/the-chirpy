import License, { ILicense } from './licence.model';
import crypto from 'crypto';

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
    const license = new License({ key, userId, expirationDate, licenseType, features, createdBy, updatedBy });
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
    const license = new License({ key, userId, expirationDate, licenseType, features, createdBy, updatedBy });
    return await license.save();
};

export const renewLicense = async (key: string, newExpirationDate: Date): Promise<ILicense | null> => {
    return await License.findOneAndUpdate({ key, isActive: true }, { expirationDate: newExpirationDate, lastUpdated: new Date() }, { new: true });
};

export const revokeLicense = async (key: string): Promise<ILicense | null> => {
    return await License.findOneAndUpdate({ key, isActive: true }, { isActive: false, lastUpdated: new Date() }, { new: true });
};

export const validateLicenseKey = async (key: string): Promise<ILicense | null> => {
    const license = await License.findOne({ key, isActive: true });
    if (!license || new Date(license.expirationDate) < new Date()) {
        return null;
    }
    return license;
};
