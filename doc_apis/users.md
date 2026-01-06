# User APIs

Base path: `/users`

> **Note**: All user management endpoints require appropriate permissions and a bearer access token.

## POST /users
- **Summary**: Create a user.
- **Auth**: `manageUsers` (admin only).
- **Body**: `name`, `email`, `password`, `role` (`user` | `admin`).
- **Responses**:
  - `201 Created` – Returns created `User`.
  - `400 Bad Request` – Duplicate email.
  - `401 Unauthorized` – Not authenticated.
  - `403 Forbidden` – Lacking permission.

## GET /users
- **Summary**: Get paginated list of users.
- **Auth**: `getUsers` (admin only).
- **Query**:
  - `name` (string) – Filter by name.
  - `role` (string) – Filter by role.
  - `sortBy` (string) – e.g. `name:asc`.
  - `projectBy` (string) – e.g. `name:hide`.
  - `limit` (int, default 10).
  - `page` (int, default 1).
- **Responses**:
  - `200 OK` – Paginated list (`results`, `page`, `limit`, `totalPages`, `totalResults`).
  - `401 Unauthorized`.
  - `403 Forbidden`.

## GET /users/{userId}
- **Summary**: Get a single user.
- **Auth**: Logged-in users can get themselves; admins can get any user.
- **Path params**: `userId`.
- **Responses**:
  - `200 OK` – Returns `User`.
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`.

## PATCH /users/{userId}
- **Summary**: Update user details.
- **Auth**: User can update self; admins can update any user.
- **Path params**: `userId`.
- **Body**: Any subset of `name`, `email`, `password`.
- **Responses**:
  - `200 OK` – Returns updated `User`.
  - `400 Bad Request` – e.g. duplicate email.
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`.

## DELETE /users/{userId}
- **Summary**: Delete a user.
- **Auth**: User can delete self; admins can delete any user.
- **Path params**: `userId`.
- **Responses**:
  - `200 OK` or `204 No Content` – On success (see implementation).
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`.
