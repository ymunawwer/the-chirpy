import { Request, Response } from 'express';
import {Permission, PermissionType } from './permission.model'; // Import PermissionType if it's defined in your model


import fastcsv from 'fast-csv';
import fs from 'fs';
import csvParser from 'csv-parser';
// import multer from 'multer';

// Multer setup for file uploads
// const upload = multer({ dest: 'uploads/' });

// Interface for request body
interface PermissionRequestBody {
  id: string;
  parentId: string;
  label: string;
  name: string;
  icon: string;
  type: typeof PermissionType;
  route: string;
  order: number;
  component: string;
  description: string;
  status: string;
  createdBy: string;
  createdByRole: string;
  updatedBy: string;
  updatedByRole: string;
  roles: string[];
  tags: string[];
  isPublic: boolean;
  metadata: Record<string, any>;
  children: PermissionRequestBody[];
}

// Extended Request type to include file property for multer
interface MulterRequest extends Request {
    file: any; // Adjust type as per multer file handling
  }
// Controller for Permission operations
const PermissionController = {

  // Create a new permission
  createPermission: async (req: Request<{}, {}, PermissionRequestBody>, res: Response) => {
    try {
      const {
        id, parentId, label, name, icon, type, route, order, component,
        description, status, createdBy, createdByRole, updatedBy, updatedByRole,
        roles, tags, isPublic, metadata, children
      } = req.body;
     
      const newPermission = new Permission({
        id,
        parentId,
        label,
        name,
        icon,
        type,
        route,
        order,
        component,
        description,
        status,
        createdBy,
        createdByRole,
        updatedBy,
        updatedByRole,
        roles,
        tags,
        isPublic,
        metadata,
        children
      });

      const savedPermission = await newPermission.save();
      res.status(201).json(savedPermission);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a permission by ID
  getPermissionById: async (req: Request<{ id: string }, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;
      const permission = await Permission.findById(id);
      if (!permission) {
         res.status(404).json({ message: 'Permission not found' });
      }
      res.status(200).json(permission);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all permissions with pagination
  getAllPermissions: async (req: Request<{}, {}, { page?: string, limit?: string, search?: string, roles?: string[] }>, res: Response) => {
    try {
      const { page = '1', limit = '10', search = '', roles = [] } = req.query;

      const query = {
        $or: [
          { label: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
        ...(roles.length && { roles: { $in: roles } }),
      };

      const permissions = await Permission.find(query)
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string));

      const totalPermissions = await Permission.countDocuments(query);

      res.status(200).json({
        totalPages: Math.ceil(totalPermissions / parseInt(limit as string)),
        currentPage: parseInt(page as string),
        totalPermissions,
        permissions,
      });
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a permission by ID
  updatePermission: async (req: Request<{ id: string }, {}, PermissionRequestBody>, res: Response) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const updatedPermission = await Permission.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      return res.status(200).json(updatedPermission);
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete a permission by ID
  deletePermission: async (req: Request<{ id: string }, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;
      const deletedPermission = await Permission.findByIdAndDelete(id);
      if (!deletedPermission) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      return res.status(200).json({ message: 'Permission deleted successfully' });
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Bulk update permissions
  bulkUpdatePermissions: async (req: Request<{}, {}, { ids: string[], updateData: Partial<PermissionRequestBody> }>, res: Response) => {
    try {
      const { ids, updateData } = req.body;
      const result = await Permission.updateMany(
        { _id: { $in: ids } },
        { $set: updateData },
        { multi: true, new: true }
      );
      return res.status(200).json(result);
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Bulk delete permissions
  bulkDeletePermissions: async (req: Request<{}, {}, { ids: string[] }>, res: Response) => {
    try {
      const { ids } = req.body;
      const result = await Permission.deleteMany({ _id: { $in: ids } });
      return res.status(200).json(result);
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get permissions in a hierarchical structure
//   getHierarchicalPermissions: async (_req: Request<{}, {}, {}>, res: Response) => {
//     try {
//       const permissions = await Permission.find();
//       const permissionMap: Record<string, PermissionRequestBody> = {};

//       permissions.forEach(permission => {
//         permissionMap[permission.id] = permission.toObject() as PermissionRequestBody;
//       });

//       const roots: PermissionRequestBody[] = [];

//       permissions.forEach(permission => {
//         if (permission.parentId) {
//           const parent = permissionMap[permission.parentId];
//           if (parent) {
//             parent.children = parent.children || [];
//             parent.children.push(permissionMap[permission.id]);
//           }
//         } else {
//           roots.push(permissionMap[permission.id]);
//         }
//       });

//       return res.status(200).json(roots);
//     } catch (error:any) {
//       return res.status(500).json({ error: error.message });
//     }
//   },
 // Get permissions in a hierarchical structure
 getHierarchicalPermissions: async (_req: Request<{}, {}, {}>, res: Response) => {
    try {
      const permissions: any[] = await Permission.find().lean().exec(); // Assuming Permission is a Mongoose model

      const permissionMap: Record<string, PermissionRequestBody> = {};

      permissions.forEach((permission: PermissionRequestBody) => {
        permissionMap[permission.id] = permission;
      });

      const roots: PermissionRequestBody[] = [];

      permissions.forEach((permission: PermissionRequestBody) => {
        if (permission.parentId && permissionMap[permission.parentId]) {
          const parent = permissionMap[permission.parentId];
          const child = permissionMap[permission.id];
          if (parent && child) {
            parent.children = parent.children || [];
            parent.children.push(child);
          }
        } else if (!permission.parentId) {
          roots.push((permissionMap[permission.id] as PermissionRequestBody));
        }
      });

      res.status(200).json(roots);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Download permissions as CSV
  downloadPermissionsCSV: async (_req: Request<{}, {}, {}>, res: Response) => {
    try {
      const permissions = await Permission.find().lean().exec();
      const ws = fs.createWriteStream('permissions.csv');
      fastcsv
        .write(permissions, { headers: true })
        .pipe(ws)
        .on('finish', () => {
          res.download('permissions.csv', 'permissions.csv', (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
            }
            fs.unlinkSync('permissions.csv');
          });
        });
    } catch (error:any) {
       res.status(500).json({ error: error.message });
    }
  },

  // Upload permissions from CSV
  uploadPermissionsCSV: async (req: MulterRequest, res: Response) => {
    try {
      const fileRows: PermissionRequestBody[] = [];
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (row: PermissionRequestBody) => {
         fileRows.push(row);
        })
        .on('end', async () => {
          try {
            await Permission.insertMany(fileRows, { ordered: false });
             res.status(201).json({ message: 'Permissions uploaded successfully' });
          } catch (err:any) {
             res.status(500).json({ error: err.message });
          }
           fs.unlinkSync(req.file.path);
        });
    } catch (error:any) {
       res.status(500).json({ error: error.message });
    }
  },

  // Analytics: Get popular permissions based on usage
  getPopularPermissions: async (_req: Request<{}, {}, {}>, res: Response) => {
    try {
      const popularPermissions = await Permission.find()
        .sort({ usageCount: -1 })
        .limit(10); // Adjust limit as needed
      return res.status(200).json(popularPermissions);
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Recommendation: Recommend permissions based on user roles or interactions
  recommendPermissions: async (_req: Request<{}, {}, {}>, res: Response) => {
    try {
      // Example logic: Recommend permissions based on user's role or past interactions
      const recommendedPermissions = await Permission.find({ roles: { $in: ['admin'] } })
        .limit(5); // Adjust limit as needed
      res.status(200).json(recommendedPermissions);
    } catch (error:any) {
        res.status(500).json({ error: error.message });
      }
    },
  };
  
export default PermissionController;