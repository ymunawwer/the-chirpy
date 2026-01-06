import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Contact, { IContact } from './contacts.model';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';

export interface CreateContactBody {
  customerName: string;
  contacts: string[];
  businessType?: string;
  customerGroup?: string;
  customerCode: string;
  lastCallAt?: Date;
  lastCallStatus?: string;
  description?: string;
  bulkUpload?: boolean;
}

export type UpdateContactBody = Partial<CreateContactBody>;

export const createContact = async (body: CreateContactBody): Promise<IContact> => {
  const existing = await Contact.findOne({ customerCode: body.customerCode });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer code already exists');
  }
  return Contact.create(body);
};

export const bulkCreateContacts = async (bodies: CreateContactBody[]): Promise<IContact[]> => {
  if (!bodies || bodies.length === 0) {
    return [];
  }

  // Check for duplicate customerCode within the request payload
  const codes = bodies.map((b) => b.customerCode);
  const uniqueCodes = new Set(codes);
  if (uniqueCodes.size !== codes.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate customerCode found in bulk payload');
  }

  // Check against existing records
  const existing = await Contact.find({ customerCode: { $in: codes } }).select('customerCode').lean();
  if (existing.length > 0) {
    const existingCodes = existing.map((e: any) => e.customerCode).join(', ');
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Customer codes already exist: ${existingCodes}`
    );
  }

  return Contact.insertMany(
    bodies.map((b) => ({
      ...b,
      bulkUpload: b.bulkUpload ?? true,
    }))
  );
};

export const queryContacts = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const contacts = await (Contact as any).paginate
    ? (Contact as any).paginate(filter, options)
    : {
        results: await Contact.find(filter).limit(options.limit as number || 10).exec(),
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 1,
        totalResults: 0,
      };
  return contacts;
};

export const getContactById = async (id: mongoose.Types.ObjectId): Promise<IContact | null> => {
  return Contact.findById(id);
};

export const updateContactById = async (
  contactId: mongoose.Types.ObjectId,
  updateBody: UpdateContactBody
): Promise<IContact | null> => {
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }

  if (updateBody.customerCode && updateBody.customerCode !== contact.customerCode) {
    const existing = await Contact.findOne({ customerCode: updateBody.customerCode });
    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Customer code already exists');
    }
  }

  Object.assign(contact, updateBody);
  await contact.save();
  return contact;
};

export const deleteContactById = async (
  contactId: mongoose.Types.ObjectId
): Promise<IContact | null> => {
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }
  await contact.deleteOne();
  return contact;
};
