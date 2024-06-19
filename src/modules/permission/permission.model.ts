import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Enum for Permission Types
export const PermissionType = {
    CATALOGUE: 'catalogue',
  MENU: 'menu',
  SUBMENU: 'submenu',
  PAGE: 'page',
  WIDGET: 'widget',
  BUTTON: 'button',
  ACTION: 'action',
  API: 'api',
  REPORT: 'report',
  FILE: 'file',
  FOLDER: 'folder',
  LINK: 'link',
  TOOL: 'tool',
  SETTING: 'setting',
  NOTIFICATION: 'notification',
  TASK: 'task',
  DASHBOARD: 'dashboard',
  SERVICE: 'service',
  MODULE: 'module',
  DATA: 'data',
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  ANALYTICS: 'analytics',
  LOG: 'log',
  AUDIT: 'audit',
  SYSTEM: 'system',
  FEATURE: 'feature',
  USER: 'user',
};

// Nested Permission Schema for Children
const ChildPermissionSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  parentId: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
    require:true,
    default:'NA'
  },
  type: {
    type: String,
    enum: Object.values(PermissionType),
    required: true,
  },
  route: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  component: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
  },
  createdByRole: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
  updatedByRole: {
    type: String,
    trim: true,
  },
  roles: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  lastAccessed: {
    type: Date,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Main Permission Schema
const PermissionSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  parentId: {
    type: String,
    default: '',
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
    require:true,
    default:'NA'
  },
  type: {
    type: String,
    enum: Object.values(PermissionType),
    required: true,
  },
  route: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  component: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
  },
  createdByRole: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
  updatedByRole: {
    type: String,
    trim: true,
  },
  roles: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  lastAccessed: {
    type: Date,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  children: [ChildPermissionSchema],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Creating the Permission model from the schema
export const Permission = mongoose.model('Permission', PermissionSchema);

// export Permission;
