import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  customerName: string;
  contacts: string[]; // phone numbers / emails
  businessType?: string;
  customerGroup?: string;
  customerCode: string;
  lastCallAt?: Date;
  lastCallStatus?: string;
  description?: string;
  bulkUpload: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    contacts: { type: [String], required: true, default: [] },
    businessType: { type: String, trim: true },
    customerGroup: { type: String, trim: true },
    customerCode: { type: String, required: true, trim: true, unique: true },
    lastCallAt: { type: Date },
    lastCallStatus: { type: String, trim: true },
    description: { type: String, trim: true },
    bulkUpload: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Contact = mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
