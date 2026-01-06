# Call Log APIs

Base path: `/call-logs`

Call logs track the lifecycle of Acharya workflow executions for a given destination (`to`), including status, timing, and error information.

Data model: see `src/modules/callLogs/callLog.model.ts` (`ICallLog`).

---

## CallLog Fields

- `eventId` (ObjectId, optional) – Reference to associated `Event`.
- `contactId` (ObjectId, optional) – Reference to associated `Contact`.
- `agentId` (string, optional) – Acharya workflow/agent ID used.
- `to` (string, required) – Destination number or identifier.
- `status` (string, required) – One of:
  - `queued`, `running`, `completed`, `failed`, `cancelled`.
- `startedAt` (Date, optional) – When processing started.
- `endedAt` (Date, optional) – When processing ended.
- `durationMs` (number, optional) – `endedAt - startedAt` in milliseconds.
- `lastError` (string, optional) – Last error message when status is `failed`.
- `externalResponse` (object, optional) – Raw response from external systems (e.g. Acharya/Twilio).
- `meta` (object, optional) – Additional data (e.g. event name, purpose, etc.).
- `createdAt`, `updatedAt` (Date; automatic timestamps).

Creation & updates are mostly performed from internal services such as the event executor, not via this public API.

---

## GET /call-logs

- **Summary**: List call logs with filtering and pagination.
- **Query parameters** (from `listCallLogs` + `queryCallLogs`):
  - `eventId` (string, optional) – Filter by associated event.
  - `contactId` (string, optional) – Filter by contact.
  - `agentId` (string, optional) – Filter by workflow/agent.
  - `status` (string, optional) – Filter by call status (`queued`, `running`, `completed`, `failed`, `cancelled`).
  - Pagination/sorting options (`IOptions`):
    - `sortBy` (string, optional).
    - `limit` (number, optional; default 10).
    - `page` (number, optional; default 1).
    - `projectBy` (string, optional).

**Business rules**
- Filter normalization:
  - If `eventId` or `contactId` is provided as a string, it is converted to a Mongo `ObjectId` before querying.
- Uses `CallLog.paginate(normalizedFilter, options)` when the paginate plugin is attached; otherwise falls back to `find` + `limit` with synthetic pagination metadata.

**Responses**
- `200 OK`
  - Body: `{ message: 'call_logs_retrieved', data: { results, page, limit, totalPages, totalResults } }`.

**Example request**
```http
GET /v1/call-logs?eventId=6760c2f19a1d4e3b4cabcdef&status=completed&page=1&limit=20 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Example success response (`200`)**
```json
{
  "message": "call_logs_retrieved",
  "data": {
    "results": [
      {
        "_id": "6760c4a59a1d4e3b4cdef001",
        "eventId": "6760c2f19a1d4e3b4cabcdef",
        "contactId": "665f0b2f9a1d4e3b4c123456",
        "agentId": "acharya-workflow-123",
        "to": "+15551234567",
        "status": "completed",
        "durationMs": 32000
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

## Internal lifecycle helpers (service-level only)

> The following operations are **not** exposed as HTTP endpoints but are important for understanding how logs evolve.

- **Create log** – `createCallLog(body: CreateCallLogBody)`
  - Accepts `eventId`, `contactId` as strings and converts them to `ObjectId`.
  - Status usually starts as `queued`.
  - Example:
    ```ts
    await createCallLog({
      eventId: "6760c2f19a1d4e3b4cabcdef",
      contactId: "665f0b2f9a1d4e3b4c123456",
      agentId: "acharya-workflow-123",
      to: "+15551234567",
      status: "queued",
      meta: { eventName: "Welcome Campaign" }
    });
    ```

- **Mark running** – `markCallRunning(id)`
  - Sets `status = 'running'` and `startedAt = now`.
  - Example:
    ```ts
    await markCallRunning(callLog._id);
    ```

- **Mark completed** – `markCallCompleted(id, externalResponse?)`
  - Loads log by ID.
  - Uses existing `startedAt` or `now` to compute `durationMs`.
  - Sets `status = 'completed'`, updates `endedAt` and `durationMs`.
  - Optionally stores `externalResponse`.
  - Example:
    ```ts
    await markCallCompleted(callLog._id, { providerCallId: "twilio-123" });
    ```

- **Mark failed** – `markCallFailed(id, error)`
  - Similar to `markCallCompleted` but:
    - Sets `status = 'failed'`.
    - Sets `lastError = error.message`.
  - Example:
    ```ts
    await markCallFailed(callLog._id, new Error("Call rejected"));
    ```
