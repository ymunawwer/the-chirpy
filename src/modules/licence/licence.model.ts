import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate, { QueryResult, IOptions } from '../paginate/paginate';

export interface ILicense extends mongoose.Document {
  key: string;
  isActive: boolean;
  expiresAt?: Date | null;
  userId: mongoose.Types.ObjectId;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILicenseModel extends mongoose.Model<ILicense> {
  paginate(filter: Record<string, any>, options: IOptions): Promise<QueryResult>;
  getActive(): Promise<ILicense | null>;
  getByUserId(userId: mongoose.Types.ObjectId): Promise<ILicense | null>;
}

const LicenseSchema = new mongoose.Schema<ILicense, ILicenseModel>(
  {
    key: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

LicenseSchema.plugin(toJSON);
LicenseSchema.plugin(paginate);

LicenseSchema.static('getActive', async function () {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
});

LicenseSchema.static('getByUserId', async function (userId: mongoose.Types.ObjectId) {
  return this.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
});

export default mongoose.model<ILicense, ILicenseModel>('License', LicenseSchema);
