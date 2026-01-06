# Auth APIs

Base path: `/auth`

## POST /auth/register
- **Summary**: Register as a new user.
- **Auth**: Public.
- **Body**: `name`, `email`, `password`.
- **Responses**:
  - `201 Created` – Returns `user` + `tokens`.
  - `400 Bad Request` – Duplicate email.

## POST /auth/login
- **Summary**: Login with email and password.
- **Auth**: Public.
- **Body**: `email`, `password`.
- **Responses**:
  - `200 OK` – Returns `user` + `tokens`.
  - `401 Unauthorized` – Invalid email or password.

## POST /auth/logout
- **Summary**: Logout by invalidating a refresh token.
- **Auth**: Public (token in body).
- **Body**: `refreshToken`.
- **Responses**:
  - `204 No Content` – Success.
  - `404 Not Found` – Token not found.

## POST /auth/refresh-tokens
- **Summary**: Get new access/refresh tokens from a refresh token.
- **Auth**: Public (token in body).
- **Body**: `refreshToken`.
- **Responses**:
  - `200 OK` – Returns `user` + new `tokens`.
  - `401 Unauthorized` – Invalid/expired token.

## POST /auth/forgot-password
- **Summary**: Send password reset email.
- **Auth**: Public.
- **Body**: `email`.
- **Responses**:
  - `204 No Content` – Email sent if user exists.
  - `404 Not Found` – User not found.

## POST /auth/reset-password
- **Summary**: Reset password using a reset token.
- **Auth**: Public (token in query).
- **Query**: `token`.
- **Body**: `password`.
- **Responses**:
  - `204 No Content` – Password reset.
  - `401 Unauthorized` – Reset failed.

## POST /auth/send-verification-email
- **Summary**: Send email verification link.
- **Auth**: Bearer token required.
- **Responses**:
  - `204 No Content` – Email sent.
  - `401 Unauthorized` – Not authenticated.

## POST /auth/verify-email
- **Summary**: Verify email using a token.
- **Auth**: Public (token in query).
- **Query**: `token`.
- **Responses**:
  - `204 No Content` – Email verified.
  - `401 Unauthorized` – Verification failed.

## GET /auth/validate-token
- **Summary**: Validate current access token.
- **Auth**: Bearer token required.
- **Responses**:
  - `200 OK` – Token is valid.
  - `401 Unauthorized` – Token invalid/expired.

## POST /auth/change-password
- **Summary**: Change password for logged-in user.
- **Auth**: Bearer token required.
- **Body**: Typically `oldPassword`, `newPassword` (see validation schema).
- **Responses**:
  - `204 No Content` or `200 OK` – On success (see implementation).
  - `400/401` – On validation or auth failure.
