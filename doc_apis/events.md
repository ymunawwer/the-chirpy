# Event APIs

Base path: `/events`

These endpoints manage **call events** that reference Acharya workflows and contacts. Events define who to contact (`contacts`), which workflow to run (`agentId`), and when/how to schedule execution.

Data model: see `src/modules/events/events.model.ts` (`IEvent`).

---

## Common Event Fields

**Core fields**
- `eventName` (string, required) – Human-readable name of the event.
- `agentId` (string, required) – Acharya workflow/agent ID to execute.
- `status` (string, default `scheduled`) – One of:
  - `scheduled`, `running`, `completed`, `cancelled`, `failed`, `paused`.
- `recurrent` (boolean, default `false`) – Whether this is a recurring event.

**Scheduling & lifecycle**
- `scheduleCron` (string, optional) – Cron-like expression for recurring events.
- `scheduleAt` (Date, optional) – One-off scheduled time.
- `repetition` (string, default `once`) – High-level repetition hint (`once`, `daily`, `weekly`, `monthly`, `custom`).
- `expiry` (Date, optional) – When this event should stop being valid.

**Contacts** (`contacts` array)
- Each item (see `IEventContact`) may include:
  - `contactId` (ObjectId, optional) – Reference to `Contact` document.
  - `contactName` (string, optional).
  - `contactNumbers` (string[]; optional, default `[]`).

**Meta & audit**
- `description` (string, optional).
- `purpose` (string, optional) – Business purpose label.
- `metadata` (object, optional) – Free-form additional data.
- `createdBy`, `updatedBy` (string, optional).
- `createdAt`, `updatedAt` (Date; automatic timestamps).

---

## POST /events

- **Summary**: Create a new event.
- **Body** (JSON, based on `CreateEventBody`):
  - `eventName` (string, required).
  - `agentId` (string, required).
  - `contacts` (array of objects, optional):
    - `contactId` (string, optional) – Will be stored as `ObjectId` if provided.
    - `contactName` (string, optional).
    - `contactNumbers` (string[]; optional).
  - `scheduleCron` (string, optional).
  - `scheduleAt` (string/Date, optional).
  - `repetition` (string, optional; default `once`).
  - `condition` (string, optional).
  - `status` (string, optional; defaults as per model to `scheduled`).
  - `description` (string, optional).
  - `recurrent` (boolean, optional; default `false`).
  - `expiry` (string/Date, optional).
  - `purpose` (string, optional).
  - `metadata` (object, optional).
  - `createdBy`, `updatedBy` (string, optional).

**Business rules**
- If `contacts` is provided, each `contactId` is converted to a Mongo `ObjectId` before persisting.
- No uniqueness checks are enforced at service level beyond what the schema enforces.

**Responses**
- `201 Created`
  - Body: `{ message: 'event_created', data: <Event> }`.
- `400 Bad Request`
  - If validation middleware (if present) or Mongoose validation fails.

**Example request**
```json
{
  "eventName": "Welcome Campaign",
  "agentId": "acharya-workflow-123",
  "contacts": [
    {
      "contactId": "665f0b2f9a1d4e3b4c123456",
      "contactName": "John Doe",
      "contactNumbers": ["+15551234567"]
    }
  ],
  "scheduleAt": "2025-01-10T09:00:00.000Z",
  "repetition": "once",
  "purpose": "onboarding",
  "metadata": { "segment": "new_users" }
}
```

**Example success response (`201`)**
```json
{
  "message": "event_created",
  "data": {
    "_id": "6760c2f19a1d4e3b4cabcdef",
    "eventName": "Welcome Campaign",
    "agentId": "acharya-workflow-123",
    "contacts": [
      {
        "contactId": "665f0b2f9a1d4e3b4c123456",
        "contactName": "John Doe",
        "contactNumbers": ["+15551234567"]
      }
    ],
    "status": "scheduled",
    "recurrent": false,
    "purpose": "onboarding",
    "metadata": { "segment": "new_users" },
    "createdAt": "2025-01-05T10:00:00.000Z",
    "updatedAt": "2025-01-05T10:00:00.000Z"
  }
}
```

---

## GET /events

- **Summary**: List events with filtering and pagination.
- **Query parameters** (see `listEvents` + `queryEvents`):
  - `eventName` (string, optional) – Filter by event name.
  - `status` (string, optional) – Filter by current status.
  - `agentId` (string, optional) – Filter by workflow/agent.
  - `contactId` (string, optional) – Filter by associated contact (implementation depends on how filter is used).
  - `recurrent` (boolean string, optional) – Filter by recurrence flag.
  - `purpose` (string, optional).
  - Pagination/sorting (from `IOptions`):
    - `sortBy` (string, optional) – e.g. `createdAt:desc`.
    - `limit` (number, optional; default 10).
    - `page` (number, optional; default 1).
    - `projectBy` (string, optional) – Projection hints like `field:hide`.

**Business rules**
- Delegates to `Event.paginate(filter, options)` if a paginate plugin is present; otherwise falls back to a simple `find` + `limit` with a synthetic pagination wrapper.

**Responses**
- `200 OK`
  - Body: `{ message: 'events_retrieved', data: { results, page, limit, totalPages, totalResults } }`.

**Example request**
```http
GET /v1/events?status=scheduled&agentId=acharya-workflow-123&page=1&limit=10 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`200`)**
```json
{
  "message": "events_retrieved",
  "data": {
    "results": [
      {
        "_id": "6760c2f19a1d4e3b4cabcdef",
        "eventName": "Welcome Campaign",
        "agentId": "acharya-workflow-123",
        "status": "scheduled",
        "recurrent": false
      }
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalResults": 1
  }
}
```

---

## GET /events/{eventId}

- **Summary**: Get a single event by ID.
- **Path params**:
  - `eventId` (string, required) – Mongo `ObjectId` as a hex string.

**Business rules**
- If `eventId` is not a string, returns `400` (`Invalid event ID`).
- If no event exists with that ID, returns `404` (`Event not found`).

**Responses**
- `200 OK`
  - Body: `{ message: 'event_retrieved', data: <Event> }`.
- `400 Bad Request`
  - Invalid or malformed `eventId`.
- `404 Not Found`
  - Event does not exist.

**Example request**
```http
GET /v1/events/6760c2f19a1d4e3b4cabcdef HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`200`)**
```json
{
  "message": "event_retrieved",
  "data": {
    "_id": "6760c2f19a1d4e3b4cabcdef",
    "eventName": "Welcome Campaign",
    "agentId": "acharya-workflow-123",
    "status": "scheduled"
  }
}
```

---

## PATCH /events/{eventId}

- **Summary**: Partially update an existing event.
- **Path params**:
  - `eventId` (string, required).
- **Body** (JSON, `UpdateEventBody` = partial of `CreateEventBody`):
  - Any subset of event fields may be provided.

**Business rules**
- Service first loads the event by ID; if not found, throws `404 Event not found`.
- If `contacts` is provided in the update payload, each `contactId` is converted to `ObjectId` before assignment.
- Uses `Object.assign(event, payload)` then `event.save()`; partial updates only affect provided fields.

**Responses**
- `200 OK`
  - Body: `{ message: 'event_updated', data: <Event> }`.
- `400 Bad Request`
  - Invalid `eventId`.
- `404 Not Found`
  - Event does not exist.

**Example request**
```http
PATCH /v1/events/6760c2f19a1d4e3b4cabcdef HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "status": "running",
  "recurrent": true
}
```

**Example success response (`200`)**
```json
{
  "message": "event_updated",
  "data": {
    "_id": "6760c2f19a1d4e3b4cabcdef",
    "status": "running",
    "recurrent": true
  }
}
```

---

## DELETE /events/{eventId}

- **Summary**: Delete an event by ID.
- **Path params**:
  - `eventId` (string, required).

**Business rules**
- Service ensures the event exists; otherwise throws `404 Event not found`.
- Uses `event.deleteOne()` to remove the document.

**Responses**
- `204 No Content`
  - Body: `{ message: 'event_deleted' }` (JSON with message, despite 204).
- `400 Bad Request`
  - Invalid `eventId`.
- `404 Not Found`
  - Event does not exist.

**Example request**
```http
DELETE /v1/events/6760c2f19a1d4e3b4cabcdef HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`204`)**
```json
{
  "message": "event_deleted"
}
