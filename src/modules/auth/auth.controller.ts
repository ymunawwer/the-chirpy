import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { tokenService } from '../token';
import { userService } from '../user';
import * as authService from './auth.service';
import { emailService } from '../email';

export const register = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body)
  const user = await userService.registerUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  // Set firstActiveOn on first successful login
  const effectiveFirstActiveOn = user.firstActiveOn || new Date();
  if (!user.firstActiveOn) {
    await userService.updateUserById(user._id as any, { firstActiveOn: effectiveFirstActiveOn });
  }
  console.log("user--",user)
  console.log("token--",tokens)
  let data = {
    "status": 0,
    "message": "",
    "data": {
        "user": {
            "id": user.id,  
            "name": user.name,
            "username": user.name,
            "email": user.email,
            "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/838.jpg",
            "createdAt": "2024-06-14T03:40:50.660Z",
            "updatedAt": "2024-06-21T13:52:42.140Z",
            // "password": "demo1234",
            "firstName": user.firstName,
            "lastName": user.lastName,
            "company": user.company,
            "designation": user.designation,
            "verificationStatus": user.verificationStatus,
            "firstActiveOn": effectiveFirstActiveOn,
            "planType": user.planType,
            "twoFactorAuthentication": user.twoFactorAuthentication,
            "role": {
                // "id": "4281707933534332",
                // "name": "Admin",
                // "label": user.role,
                // "status": 1,
                // "order": 1,
                // "desc": "Super Admin",
                // "permission": user.permission
                "id": user.role?.id,
                "name": user.role?.name,
                "label": user.role?.label,
                "status": user.role?.status,
                "order": user.role?.order,
                "desc": user.role?.desc,
                "permission": user.permission
            },
            "permissions": user.permission
        },
        "accessToken": tokens.access.token,
        "refreshToken": tokens.refresh.token
    }
}
  res.send(data);
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...userWithTokens });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query['token'], req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.name);
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query['token']);
  res.status(httpStatus.NO_CONTENT).send();
});

export const validateToken = catchAsync(async (req: Request, res: Response) => {
  res.status(httpStatus.OK).send({ user: req.user });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  // Expecting oldPassword and newPassword in body, and authenticated user from auth middleware
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
  const userId = (req.user as any)?._id;
  await authService.changePassword(userId, oldPassword, newPassword);
  res.status(httpStatus.NO_CONTENT).send();
});
