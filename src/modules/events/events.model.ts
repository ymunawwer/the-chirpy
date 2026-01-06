import mongoose, { Document, Schema } from 'mongoose';

export type EventStatus =
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'paused';

export interface IEventContact {
  contactId?: mongoose.Types.ObjectId;
  contactName?: string;
  contactNumbers?: string[];
}

export interface IEvent extends Document {
  contacts: IEventContact[];
  agentId: string;
  scheduleCron?: string; // cron-like expression
  scheduleAt?: Date; // for one-off schedules
  repetition?: string; // e.g. once,daily,weekly,monthly,custom
  condition?: string;
  status: EventStatus;
  description?: string;
  eventName: string;
  recurrent: boolean;
  expiry?: Date;
  purpose?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
  {
    contacts: [
      {
        contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
        contactName: { type: String, trim: true },
        contactNumbers: { type: [String], default: [] },
      },
    ],
    agentId: { type: String, required: true, trim: true },
    scheduleCron: { type: String, trim: true },
    scheduleAt: { type: Date },
    repetition: { type: String, trim: true, default: 'once' },
    condition: { type: String, trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled', 'failed', 'paused'],
      default: 'scheduled',
    },
    description: { type: String, trim: true },
    eventName: { type: String, required: true, trim: true },
    recurrent: { type: Boolean, default: false },
    expiry: { type: Date },
    purpose: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

const Event = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
