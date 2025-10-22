import Joi from 'joi';
import { password } from '../validate/custom.validation';
// (types removed) no direct dependency on user interfaces here

// Use a general record to avoid tight coupling with interface keys
const registerBody: Record<string, any> = {
  permission: Joi.any(),
  email: Joi.string().required().email(),
  password: Joi.string().required().custom(password),
  name: Joi.string().required(),
  username: Joi.string().required(),
  // Optional profile fields
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

export const register = {
  body: Joi.object().keys(registerBody),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

export const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};
