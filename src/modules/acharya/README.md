# Acharya Module APIs

This document describes all HTTP APIs exposed by the Acharya module via `src/routes/v1/acharya.route.ts`.

Base URL for these routes:

- `/v1/acharya`

All examples below assume the service is running on `http://localhost:3010`.

---

## 1. Execute Workflow (single)

**Endpoint**

- `POST /v1/acharya/execute`

**Description**

Trigger execution of a single Acharya workflow for one destination. The request is logged in MongoDB (`ChirpyAcharyaLog`).

- If Kafka is configured, the call is **queued** and processed asynchronously.
- If Kafka is not configured, execution happens **synchronously** inside the HTTP request.

**Request body**

```json
{
  "to": "+917000000000",
  "data": "optional payload string",
  "agentId": "<workflow-id>"
}
```

**Responses**

- **200 OK** (when Kafka is disabled)

  ```json
  {
    "message": "acharya_workflow_executed",
    "logId": "<acharya-log-id>",
    "externalResponse": { "...": "response from Acharya Engine" }
  }
  ```

- **202 Accepted** (when Kafka is enabled)

  ```json
  {
    "message": "acharya_workflow_queued",
    "logId": "<acharya-log-id>"
  }
  ```

- **500** – configuration or remote call failure.

---

## 2. Execute Workflow (bulk)

**Endpoint**

- `POST /v1/acharya/execute/bulk`

**Description**

Trigger execution of the same workflow for multiple customers at once.

**Request body**

```json
{
  "agentId": "<workflow-id>",
  "customer": [
    { "to": "+917000000001", "data": "" },
    { "to": "+917000000002", "data": "optional" },
    { "to": "+917000000003", "data": "" }
  ]
}
```

**Responses**

- **200 OK** (when Kafka is disabled – executes sequentially inside the request)

  ```json
  {
    "message": "acharya_bulk_workflow_executed",
    "data": [
      { "to": "+917000000001", "logId": "<log-id-1>", "status": "success" },
      { "to": "+917000000002", "logId": "<log-id-2>", "status": "success" }
    ]
  }
  ```

- **202 Accepted** (when Kafka is enabled – enqueues all messages)

  ```json
  {
    "message": "acharya_bulk_workflow_queued",
    "data": [
      { "to": "+917000000001", "logId": "<log-id-1>" },
      { "to": "+917000000002", "logId": "<log-id-2>" }
    ]
  }
  ```

Each `logId` refers to an entry in `ChirpyAcharyaLog` and can be polled via the status API.

---

## 3. Get Execution Status

**Endpoint**

- `GET /v1/acharya/status/{logId}`

**Description**

Retrieve the current execution status for a single workflow execution, using the `logId` returned from `execute` or `execute/bulk`.

**Path params**

- `logId` – MongoDB `_id` of the `ChirpyAcharyaLog` document.

**Responses**

- **200 OK**

  ```json
  {
    "message": "acharya_execution_status",
    "data": {
      "id": "<log-id>",
      "status": "pending | success | failed",
      "responseStatus": 200,
      "errorMessage": null,
      "createdAt": "2025-12-01T12:00:00.000Z",
      "updatedAt": "2025-12-01T12:00:05.000Z"
    }
  }
  ```

- **404 Not Found** – when the `logId` does not exist.

---

## 4. Workflow Management Proxies

These endpoints proxy to the Acharya Engine workflow APIs using the configured `ACHARYA_WORKFLOW_URL` and licence.

### 4.1 Get Workflow by ID

**Endpoint**

- `GET /v1/acharya/workflows/{workflowId}`

**Description**

Fetch a workflow definition from the Acharya Engine.

**Path params**

- `workflowId` – the workflow ID in Acharya.

**Response**

- **200 OK** – JSON structure as returned by Acharya Engine.

---

### 4.2 Publish Workflow

**Endpoint**

- `POST /v1/acharya/workflows/{workflowId}/publish`

**Description**

Publish a workflow in the Acharya Engine.

**Response**

- **200 OK** – publish result from Acharya Engine.

---

### 4.3 Update Workflow

**Endpoint**

- `PUT /v1/acharya/workflows/{workflowId}`

**Description**

Update a workflow definition.

**Request body**

```json
{
  "name": "Updated workflow name",
  "description": "Updated description",
  "steps": [
    { "type": "task", "config": { "foo": "bar" } }
  ]
}
```

**Response**

- **200 OK** – updated workflow from Acharya Engine.

---

### 4.4 List Workflow Cards

**Endpoint**

- `GET /v1/acharya/workflows/cards`

**Description**

Return workflow "cards" (summary objects) from the Acharya Engine.

**Response**

- **200 OK** – array or object as returned by Acharya Engine.

---

### 4.5 List Workflows (paginated)

**Endpoint**

- `GET /v1/acharya/workflows`

**Query params**

- `page` (optional, number)
- `limit` (optional, number)

Example:

`GET /v1/acharya/workflows?page=1&limit=20`

**Response**

- **200 OK** – paginated list of workflows as returned by Acharya Engine.

---

### 4.6 Create Workflow

**Endpoint**

- `POST /v1/acharya/workflows`

**Description**

Create a new workflow in the Acharya Engine.

**Request body**

```json
{
  "name": "Sample workflow",
  "description": "My test workflow",
  "steps": [
    { "type": "task", "config": { "foo": "bar" } }
  ]
}
```

**Response**

- **201 Created** – created workflow as returned by Acharya Engine.

---

## 5. Environment & Dependencies

The Acharya module relies on the following environment variables:

- `ACHARYA_WORKFLOW_URL` – Base URL for the Acharya Engine workflow API (e.g. `https://api-acharya.revoft.com/workflow/v1`).
- `ACHARYA_WORKFLOW_LICENCE` – Licence key sent as `x-license-key` header.
- `KAFKA_BROKERS` – Comma-separated list of Kafka brokers (e.g. `localhost:9092`).
- `KAFKA_ACHARYA_EXECUTE_TOPIC` – Kafka topic for `execute` jobs (default: `acharya-execute`).

All requests are logged in MongoDB collection `ChirpyAcharyaLog` with status tracking.
