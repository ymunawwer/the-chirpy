import mongoose, { Schema, Document } from 'mongoose';

// Define an interface representing a document in MongoDB
interface JobDocument extends Document {
  jobId: string;
  title: string;
  description: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  company: {
    name: string;
    website: string;
    logoUrl: string;
    industry: string;
    size: string; // Enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+']
    headquarters: string;
    founded: number;
  };
  location: {
    city: string;
    state: string;
    country: string;
    postalCode: string;
    remote: boolean; // Indicates if the job allows remote work
  };
  employmentType: string; // Enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']
  salary: {
    min: number;
    max: number;
    currency: string; // Enum: ['USD', 'EUR', 'GBP', etc.]
    payPeriod: string; // Enum: ['Hourly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly']
  };
  requirements: {
    education: string; // Enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate']
    experience: number; // Years of experience required
    skills: string[];
    certifications: string[];
    languages: string[]; // Languages required for the job
    travelRequired: boolean; // Indicates if travel is required
  };
  benefits: string[];
  applicationDetails: {
    url: string;
    contactEmail: string;
    phoneNumber: string;
    applicationDeadline: Date;
    applicationInstructions: string;
  };
  postedDate: Date;
  closingDate: Date;
  status: string; // Enum: ['Open', 'Closed', 'Draft']
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  interviews: {
    stages: string[]; // Interview stages
    interviewerIds: string[]; // IDs of interviewers
  };
  department: string; // Department where the job is located
  workSchedule: string; // Enum: ['Day', 'Night', 'Flexible', 'Rotational']
  incentives: string[]; // Any incentives offered with the job
  additionalNotes: string; // Any additional notes about the job
}

// Create a schema corresponding to the document interface
const jobSchema = new Schema({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  summary: { type: String },
  responsibilities: [{ type: String }],
  qualifications: [{ type: String }],
  company: {
    name: { type: String, required: true },
    website: { type: String, required: true },
    logoUrl: { type: String, required: true },
    industry: { type: String },
    size: { 
      type: String, 
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'] 
    },
    headquarters: { type: String },
    founded: { type: Number },
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    remote: { type: Boolean, default: false },
  },
  employmentType: { 
    type: String, 
    required: true, 
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'] 
  },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { 
      type: String, 
      required: true, 
      enum: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'CHF', 'CNY', 'JPY', 'Others'] 
    },
    payPeriod: { 
      type: String, 
      enum: ['Hourly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly']
    }
  },
  requirements: {
    education: { 
      type: String, 
      required: true, 
      enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate'] 
    },
    experience: { type: Number, required: true },
    skills: [{ type: String, required: true }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    travelRequired: { type: Boolean, default: false },
  },
  benefits: [{ type: String }],
  applicationDetails: {
    url: { type: String },
    contactEmail: { type: String },
    phoneNumber: { type: String },
    applicationDeadline: { type: Date },
    applicationInstructions: { type: String },
  },
  postedDate: { type: Date, required: true },
  closingDate: { type: Date },
  status: { 
    type: String, 
    required: true, 
    enum: ['Open', 'Closed', 'Draft'] 
  },
  metadata: { type: Schema.Types.Mixed },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now },
  interviews: {
    stages: [{ type: String }],
    interviewerIds: [{ type: String }],
  },
  department: { type: String },
  workSchedule: { 
    type: String, 
    enum: ['Day', 'Night', 'Flexible', 'Rotational'] 
  },
  incentives: [{ type: String }],
  additionalNotes: { type: String },
});

// Create a model based on the schema
const Job = mongoose.model<JobDocument>('Job', jobSchema);

export default Job;
