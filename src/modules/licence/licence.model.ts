import mongoose, { Document, Schema } from 'mongoose';

export interface ILicense extends Document {
    key: string;
    userId: string;
    creationDate: Date;
    expirationDate: Date;
    licenseType: string;
    features: Record<string, any>;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    lastUpdated: Date;
}

const LicenseSchema: Schema = new Schema({
    key: { type: String, unique: true, required: true },
    userId: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    expirationDate: { type: Date, required: true },
    licenseType: { type: String, required: true },
    features: { type: Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<ILicense>('License', LicenseSchema);
