import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import pick from '../utils/pick';
import { IOptions } from '../paginate/paginate';
import * as contactService from './contacts.service';

export const createContact = catchAsync(async (req: Request, res: Response) => {
  const contact = await contactService.createContact(req.body);
  return res.status(httpStatus.CREATED).json({ message: 'contact_created', data: contact });
});

export const bulkUploadContacts = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const contactsArray = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.contacts)
      ? payload.contacts
      : null;

  if (!contactsArray) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Expected an array of contacts or { contacts: [...] }');
  }

  const contactsToCreate = contactsArray as any[];

  // Fire-and-forget: perform bulk creation in the background
  // Errors will be logged to console but will not block the HTTP response
  // eslint-disable-next-line no-console
  contactService.bulkCreateContacts(contactsToCreate).catch((err) => console.error('Bulk contacts upload failed:', err));

  return res.status(httpStatus.ACCEPTED).json({
    message: 'contacts_bulk_upload_queued',
    count: contactsToCreate.length,
  });
});

export const listContacts = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['customerName', 'businessType', 'customerGroup', 'customerCode', 'bulkUpload']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await contactService.queryContacts(filter, options);
  return res.status(httpStatus.OK).json({ message: 'contacts_retrieved', data: result });
});

export const getContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    const contact = await contactService.getContactById(new mongoose.Types.ObjectId(req.params['contactId']));
    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    return res.status(httpStatus.OK).json({ message: 'contact_retrieved', data: contact });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid contact ID');
});

export const updateContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    const contact = await contactService.updateContactById(
      new mongoose.Types.ObjectId(req.params['contactId']),
      req.body
    );
    return res.status(httpStatus.OK).json({ message: 'contact_updated', data: contact });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid contact ID');
});

export const deleteContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    await contactService.deleteContactById(new mongoose.Types.ObjectId(req.params['contactId']));
    return res.status(httpStatus.NO_CONTENT).json({ message: 'contact_deleted' });
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid contact ID');
});
