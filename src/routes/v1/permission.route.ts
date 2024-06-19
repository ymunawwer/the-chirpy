import express, { Router } from 'express';
import PermissionController from '../../modules/permission/permission.controller';
// import multer from 'multer';
// const upload = multer.diskStorage({ dest: 'uploads/' });

const router: Router = express.Router();

// Route to create a new permission
router.post('/permissions', PermissionController.createPermission);

// Route to get a permission by ID
router.get('/permissions/:id', PermissionController.getPermissionById);

// Route to get all permissions with pagination and search
router.get('/permissions', PermissionController.getAllPermissions);

// Route to update a permission by ID
router.put('/permissions/:id', PermissionController.updatePermission);

// Route to delete a permission by ID
router.delete('/permissions/:id', PermissionController.deletePermission);

// Route to bulk update permissions
router.put('/permissions/bulk', PermissionController.bulkUpdatePermissions);

// Route to bulk delete permissions
router.delete('/permissions/bulk', PermissionController.bulkDeletePermissions);

// Route to get permissions in a hierarchical structure
router.get('/permissions/hierarchy', PermissionController.getHierarchicalPermissions);

// Route to download permissions as CSV
router.get('/permissions/download/csv', PermissionController.downloadPermissionsCSV);

// Route to upload permissions from CSV
// router.post('/permissions/upload/csv', upload.single('file'), PermissionController.uploadPermissionsCSV);

export default router;
