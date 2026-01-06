# Licence APIs

Base path: `/licence` (v1 router)

This module exposes both **REST-style licence resources** and **backward-compatible key-based endpoints**.

> Auth requirements are partly enforced via middleware (e.g. `auth()` on `/licence/me`) and partly left open; see controller and route configuration for exact rules.

---

## REST-style licence endpoints

### GET /licence
- **Summary**: List licences.
- **Query**:
  - `key` – Filter by licence key.
  - `isActive` – Filter by active/inactive status.
  - `userId` – Filter by user.
  - Pagination/sorting (see common query params: `sortBy`, `limit`, `page`, `projectBy`).
- **Responses**:
  - `200 OK` – Paginated licences.

### GET /licence/active
- **Summary**: Get the current active licence (if any).
- **Responses**:
  - `200 OK` – Returns active licence.
  - `404 Not Found` – No active licence.

### GET /licence/user/{userId}
- **Summary**: Get licence associated with a given user.
- **Path params**:
  - `userId` – User identifier (Mongo ObjectId as string).
- **Responses**:
  - `200 OK` – Returns user’s licence.
  - `400 Bad Request` – Invalid user ID.
  - `404 Not Found` – No licence for this user.

### GET /licence/{licenseId}
- **Summary**: Get licence by its ID.
- **Path params**:
  - `licenseId` – Licence identifier (Mongo ObjectId as string).
- **Responses**:
  - `200 OK` – Returns licence.
  - `400 Bad Request` – Invalid licence ID.
  - `404 Not Found` – Licence not found.

### POST /licence
- **Summary**: Create a new licence.
- **Body** (JSON):
  - `userId` – User ID.
  - `expirationDate` – Expiration date.
  - `licenseType` – Type of licence.
  - `features` – Arbitrary feature object.
  - `createdBy` – Creator identifier.
  - `updatedBy` – Initial updater identifier.
- **Responses**:
  - `201 Created` – `license_created` + created licence.

### POST /licence/me
- **Summary**: Create a licence for the authenticated user.
- **Auth**: Bearer token required (`auth()` middleware).
- **Body**: Same as `POST /licence` but `userId` is derived from the authenticated user.
- **Responses**:
  - `201 Created` – `license_created` + created licence.
  - `401 Unauthorized` – If user is not authenticated.

### PATCH /licence/{licenseId}
- **Summary**: Update an existing licence.
- **Path params**:
  - `licenseId` – Licence ID.
- **Body**: Partial licence fields to update.
- **Responses**:
  - `200 OK` – `license_updated` + updated licence.
  - `400 Bad Request` – Invalid licence ID.

### DELETE /licence/{licenseId}
- **Summary**: Delete a licence by ID.
- **Path params**:
  - `licenseId` – Licence ID.
- **Responses**:
  - `204 No Content` – Licence deleted.
  - `400 Bad Request` – Invalid licence ID.

### POST /licence/{licenseId}/activate
- **Summary**: Mark a licence as active.
- **Path params**:
  - `licenseId` – Licence ID.
- **Responses**:
  - `200 OK` – `license_activated` + updated licence.
  - `400 Bad Request` – Invalid licence ID.

### POST /licence/{licenseId}/deactivate
- **Summary**: Mark a licence as inactive.
- **Path params**:
  - `licenseId` – Licence ID.
- **Responses**:
  - `200 OK` – `license_deactivated` + updated licence.
  - `400 Bad Request` – Invalid licence ID.

---

## Backward-compatible key-based endpoints

These endpoints use explicit licence keys in the body or headers and are preserved for backward compatibility.

### POST /licence/create
- **Summary**: Create a licence and return its key.
- **Body**:
  - `userId`, `expirationDate`, `licenseType`, `features`, `createdBy`, `updatedBy`.
- **Responses**:
  - `201 Created` – `{ message: 'License key created', key }`.
  - `400 Bad Request` – `Error creating license key`.

### POST /licence/activate
- **Summary**: Activate a licence and return its key.
- **Body**:
  - `userId`, `expirationDate`, `licenseType`, `features`, `createdBy`, `updatedBy`.
- **Responses**:
  - `201 Created` – `{ message: 'License key activated', key }`.
  - `400 Bad Request` – `Error activating license key`.

### POST /licence/renew
- **Summary**: Renew an existing licence using its key.
- **Body**:
  - `key` – Licence key.
  - `newExpirationDate` – New expiration date.
- **Responses**:
  - `200 OK` – `License key renewed`.
  - `400 Bad Request` – Key not found/inactive or other error.

### POST /licence/revoke
- **Summary**: Revoke (deactivate) a licence using its key.
- **Body**:
  - `key` – Licence key.
- **Responses**:
  - `200 OK` – `License key revoked`.
  - `400 Bad Request` – Key not found/already inactive or other error.

### GET /licence/validate
- **Summary**: Validate a licence key via header.
- **Headers**:
  - `x-license-key` – Licence key (required).
- **Responses**:
  - `200 OK` – `License key is valid` + licence data.
  - `401 Unauthorized` – Key missing or invalid/expired/inactive.
  - `400 Bad Request` – Error while validating key.
