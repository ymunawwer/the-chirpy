# Contact APIs

Base path: `/contacts`

Contacts represent customers and their contact channels (phone numbers/emails). A unique `customerCode` is enforced at the database and service level.

Data model: see `src/modules/contacts/contacts.model.ts` (`IContact`).

---

## Common Contact Fields

- `customerName` (string, required) – Display name of the customer.
- `contacts` (string[], required) – List of contact channels (e.g. phone numbers, emails).
- `businessType` (string, optional) – e.g. industry or segment.
- `customerGroup` (string, optional) – Grouping label.
- `customerCode` (string, required, unique) – Unique identifier for the customer.
- `lastCallAt` (Date, optional) – Timestamp of last call.
- `lastCallStatus` (string, optional) – Status of last call.
- `description` (string, optional).
- `bulkUpload` (boolean, default `false`) – Flag indicating if created via bulk upload.
- `createdAt`, `updatedAt` (Date; automatic timestamps).

---

## POST /contacts

- **Summary**: Create a single contact.
- **Body** (JSON, `CreateContactBody`):
  - `customerName` (string, required).
  - `contacts` (string[], required) – Must contain at least one value.
  - `businessType` (string, optional).
  - `customerGroup` (string, optional).
  - `customerCode` (string, required, unique).
  - `lastCallAt` (string/Date, optional).
  - `lastCallStatus` (string, optional).
  - `description` (string, optional).
  - `bulkUpload` (boolean, optional; default `false`).

**Business rules**
- Before creation, service checks `Contact.findOne({ customerCode })`:
  - If found, throws `400 Customer code already exists`.
- On success, stores the record using `Contact.create`.

**Responses**
- `201 Created`
  - Body: `{ message: 'contact_created', data: <Contact> }`.
- `400 Bad Request`
  - Invalid payload or duplicate `customerCode`.

**Example request**
```json
{
  "customerName": "Acme Corp",
  "contacts": ["+15551234567"],
  "businessType": "SaaS",
  "customerGroup": "enterprise",
  "customerCode": "ACME-001",
  "description": "Primary billing contact"
}
```

**Example success response (`201`)**
```json
{
  "message": "contact_created",
  "data": {
    "_id": "6760c3e29a1d4e3b4cabc001",
    "customerName": "Acme Corp",
    "contacts": ["+15551234567"],
    "businessType": "SaaS",
    "customerGroup": "enterprise",
    "customerCode": "ACME-001",
    "bulkUpload": false,
    "createdAt": "2025-01-05T10:05:00.000Z",
    "updatedAt": "2025-01-05T10:05:00.000Z"
  }
}
```

---

## POST /contacts/bulk

- **Summary**: Bulk upload multiple contacts asynchronously.
- **Body** (JSON): either of:
  - An **array** of `CreateContactBody` objects, or
  - An object `{ contacts: CreateContactBody[] }`.

**Business rules**
- Controller normalizes body into `contactsToCreate` array; if neither an array nor `{ contacts: [...] }` is provided, returns:
  - `400 Expected an array of contacts or { contacts: [...] }`.
- Service validates bulk payload:
  - Rejects if payload is empty (returns empty array).
  - Checks for **duplicate `customerCode` within the same payload**; if duplicates exist, throws `400 Duplicate customerCode found in bulk payload`.
  - Checks for **existing contacts** with any of the provided `customerCode`s; if found, throws `400 Customer codes already exist: ...`.
- On success, `Contact.insertMany` is called with each item forced to `bulkUpload: true` (if not explicitly set).
- This is executed as **fire-and-forget**:
  - HTTP request returns **before** the DB write finishes.
  - Errors during insertion are logged to the server console, but **do not** change the HTTP status of this request.

**Responses (from controller)**
- `202 Accepted`
  - Body: `{ message: 'contacts_bulk_upload_queued', count: <number-of-items> }`.
- `400 Bad Request`
  - If body format is invalid.
  - If service throws a validation error (e.g. duplicate codes), depending on where you call it (note: current implementation catches errors only in the background call).

**Example request (array form)**
```json
[
  {
    "customerName": "Acme Corp",
    "contacts": ["+15551234567"],
    "customerCode": "ACME-001"
  },
  {
    "customerName": "Beta Inc",
    "contacts": ["+15557654321"],
    "customerCode": "BETA-001"
  }
]
```

**Example success response (`202`)**
```json
{
  "message": "contacts_bulk_upload_queued",
  "count": 2
}
```

---

## GET /contacts

- **Summary**: List contacts with filtering and pagination.
- **Query parameters** (see `listContacts` + `queryContacts`):
  - `customerName` (string, optional).
  - `businessType` (string, optional).
  - `customerGroup` (string, optional).
  - `customerCode` (string, optional).
  - `bulkUpload` (boolean string, optional).
  - Pagination/sorting options (`IOptions`):
    - `sortBy` (string, optional) – e.g. `createdAt:desc`.
    - `limit` (number, optional; default 10).
    - `page` (number, optional; default 1).
    - `projectBy` (string, optional).

**Business rules**
- If the `paginate` plugin is attached to the `Contact` model, uses it.
- Otherwise, falls back to a simple `find` + `limit` wrapper with computed pagination metadata.

**Responses**
- `200 OK`
  - Body: `{ message: 'contacts_retrieved', data: { results, page, limit, totalPages, totalResults } }`.

**Example request**
```http
GET /v1/contacts?customerGroup=enterprise&limit=20&page=1 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`200`)**
```json
{
  "message": "contacts_retrieved",
  "data": {
    "results": [
      {
        "_id": "6760c3e29a1d4e3b4cabc001",
        "customerName": "Acme Corp",
        "customerGroup": "enterprise",
        "customerCode": "ACME-001"
      }
    ],
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalResults": 1
  }
}
```

---

## GET /contacts/{contactId}

- **Summary**: Get a single contact by MongoDB ID.
- **Path params**:
  - `contactId` (string, required) – Mongo `ObjectId` as string.

**Business rules**
- If `contactId` is not a string, returns `400 Invalid contact ID`.
- If no contact is found with that ID, returns `404 Contact not found`.

**Responses**
- `200 OK`
  - Body: `{ message: 'contact_retrieved', data: <Contact> }`.
- `400 Bad Request` – Invalid `contactId`.
- `404 Not Found` – Contact does not exist.

**Example request**
```http
GET /v1/contacts/6760c3e29a1d4e3b4cabc001 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`200`)**
```json
{
  "message": "contact_retrieved",
  "data": {
    "_id": "6760c3e29a1d4e3b4cabc001",
    "customerName": "Acme Corp",
    "customerCode": "ACME-001"
  }
}
```

---

## PATCH /contacts/{contactId}

- **Summary**: Partially update a contact.
- **Path params**:
  - `contactId` (string, required).
- **Body** (JSON, `UpdateContactBody` = partial of `CreateContactBody`):
  - Any subset of contact fields may be provided.

**Business rules**
- Loads contact by ID; if not found, throws `404 Contact not found`.
- If `customerCode` is being changed, checks uniqueness:
  - If a different contact already has the new `customerCode`, throws `400 Customer code already exists`.
- Applies updates via `Object.assign(contact, updateBody)` and saves.

**Responses**
- `200 OK`
  - Body: `{ message: 'contact_updated', data: <Contact> }`.
- `400 Bad Request` – Invalid `contactId` or duplicate `customerCode`.
- `404 Not Found` – Contact does not exist.

**Example request**
```http
PATCH /v1/contacts/6760c3e29a1d4e3b4cabc001 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "customerName": "Acme Corp (Updated)",
  "customerCode": "ACME-001"
}
```

**Example success response (`200`)**
```json
{
  "message": "contact_updated",
  "data": {
    "_id": "6760c3e29a1d4e3b4cabc001",
    "customerName": "Acme Corp (Updated)",
    "customerCode": "ACME-001"
  }
}
```

---

## DELETE /contacts/{contactId}

- **Summary**: Delete a contact by ID.
- **Path params**:
  - `contactId` (string, required).

**Business rules**
- Loads contact by ID; if not found, throws `404 Contact not found`.
- Uses `contact.deleteOne()` to remove the document.

**Responses**
- `204 No Content`
  - Body: `{ message: 'contact_deleted' }` (JSON with message, despite 204).
- `400 Bad Request` – Invalid `contactId`.
- `404 Not Found` – Contact does not exist.

**Example request**
```http
DELETE /v1/contacts/6760c3e29a1d4e3b4cabc001 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`204`)**
```json
{
  "message": "contact_deleted"
}
