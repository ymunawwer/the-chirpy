import express from 'express';
import * as contactsController from '../../modules/contacts/contacts.controller';

const router = express.Router();

// RESTful contacts routes
router.post('/', contactsController.createContact);
router.post('/bulk', contactsController.bulkUploadContacts);
router.get('/', contactsController.listContacts);
router.get('/:contactId', contactsController.getContact);
router.patch('/:contactId', contactsController.updateContact);
router.delete('/:contactId', contactsController.deleteContact);

export default router;
