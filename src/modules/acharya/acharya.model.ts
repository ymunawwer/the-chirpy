import mongoose, { Document, Schema } from 'mongoose';

export interface IAcharyaLog extends Document {
  to: string;
  data?: string;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  responseStatus?: number;
  responseBody?: any;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AcharyaLogSchema: Schema = new Schema(
  {
    to: { type: String, required: true },
    data: { type: String },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    responseStatus: { type: Number },
    responseBody: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

const AcharyaLog = mongoose.model<IAcharyaLog>('ChirpyAcharyaLog', AcharyaLogSchema);

export default AcharyaLog;
