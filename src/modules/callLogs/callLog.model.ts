import mongoose, { Document, Schema } from 'mongoose';

export type CallStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ICallLog extends Document {
  eventId?: mongoose.Types.ObjectId; // reference to Event
  contactId?: mongoose.Types.ObjectId; // reference to Contact
  agentId?: string; // Acharya workflow/agent id
  to: string; // destination number or identifier
  status: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  durationMs?: number;
  lastError?: string;
  externalResponse?: Record<string, any>;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CallLogSchema: Schema<ICallLog> = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    agentId: { type: String, trim: true },
    to: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
      default: 'queued',
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationMs: { type: Number },
    lastError: { type: String },
    externalResponse: { type: Schema.Types.Mixed },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const CallLog = mongoose.model<ICallLog>('CallLog', CallLogSchema);

export default CallLog;
