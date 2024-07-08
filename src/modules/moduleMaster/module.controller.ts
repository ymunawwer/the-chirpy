import { Module, IModule } from './module.model';
import { Request, Response } from 'express';
// Create a new permission
export const createPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPermission = new Module(req.body);
    const savedPermission = await newPermission.save();
    res.status(201).json(savedPermission);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all permissions
export const getAllPermissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permissions: IModule[] = await Module.find();
    res.status(200).json(permissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a permission by ID
export const getPermissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const permission: IModule | null = await Module.findById(req.params['id']);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }
    res.status(200).json(permission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a permission by ID
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedPermission: IModule | null = await Module.findByIdAndUpdate(req.params['id'], req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPermission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }
    res.status(200).json(updatedPermission);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a permission by ID
export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedPermission: IModule | null = await Module.findByIdAndDelete(req.params['id']);
    if (!deletedPermission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }
    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};