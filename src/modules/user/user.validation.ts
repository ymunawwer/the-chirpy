import Joi from 'joi';
import { password, objectId } from '../validate/custom.validation';
import { NewCreatedUser } from './user.interfaces';

const createUserBody: Record<string, any> = {
  permission: Joi.any(),
  email: Joi.string().required().email(),
  password: Joi.string().required().custom(password),
  name: Joi.string().required(),
  username: Joi.string().required(),
  role: Joi.string().required().valid('user', 'admin'),
  firstName: Joi.string(),
  lastName: Joi.string(),
  company: Joi.string(),
  designation: Joi.string(),
  verificationStatus: Joi.object({
    email: Joi.boolean(),
    phone: Joi.boolean(),
  }),
  firstActiveOn: Joi.date(),
  planType: Joi.string(),
  twoFactorAuthentication: Joi.boolean(),
};

export const createUser = {
  body: Joi.object().keys(createUserBody),
};

export const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      username: Joi.string(),
      role: Joi.string().valid('user', 'admin'),
      permission: Joi.any(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      company: Joi.string(),
      designation: Joi.string(),
      verificationStatus: Joi.object({
        email: Joi.boolean(),
        phone: Joi.boolean(),
      }),
      firstActiveOn: Joi.date(),
      planType: Joi.string(),
      twoFactorAuthentication: Joi.boolean(),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
