import mongoose, { Document, Schema } from 'mongoose';

// Enum for Permission Types
export enum PermissionType {
  CATALOGUE = 'catalogue',
  MENU = 'menu',
  SUBMENU = 'submenu',
  PAGE = 'page',
  WIDGET = 'widget',
  BUTTON = 'button',
  ACTION = 'action',
  API = 'api',
  REPORT = 'report',
  FILE = 'file',
  FOLDER = 'folder',
  LINK = 'link',
  TOOL = 'tool',
  SETTING = 'setting',
  NOTIFICATION = 'notification',
  TASK = 'task',
  DASHBOARD = 'dashboard',
  SERVICE = 'service',
  MODULE = 'module',
  DATA = 'data',
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  ANALYTICS = 'analytics',
  LOG = 'log',
  AUDIT = 'audit',
  SYSTEM = 'system',
  FEATURE = 'feature',
  USER = 'user',
}

export interface IModule extends Document {
  id: string;
  parentId: string;
  label: string;
  name: string;
  icon: string;
  type: PermissionType;
  route: string;
  order: number;
  component?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdByRole?: string;
  updatedBy?: string;
  updatedByRole?: string;
  roles: string[];
  tags: string[];
  lastAccessed?: Date;
  isPublic: boolean;
  metadata: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ModulesSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    parentId: { type: String, default: '', trim: true },
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, trim: true, required: true, default: 'NA' },
    type: { type: String, enum: Object.values(PermissionType), required: true },
    route: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    component: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: String, required: true, trim: true },
    createdByRole: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
    updatedByRole: { type: String, trim: true },
    roles: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    lastAccessed: { type: Date },
    isPublic: { type: Boolean, default: false },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Module = mongoose.model<IModule>('ModulesMaster', ModulesSchema);
