# Acharya APIs

Base path: `/acharya` (v1 router)

These endpoints proxy operations to the external Acharya workflow engine: executing workflows, listing and managing workflows, and checking execution status.

> Auth and authorization are not explicitly enforced in the route file; see `acharya.controller` and any applied middleware for details if you add auth later.

---

## Execution endpoints

### POST /acharya/execute
- **Summary**: Execute a single Acharya workflow.
- **Request body** (`AcharyaExecuteRequest`):
  - `to` (string, required) – Destination identifier (e.g. phone number).
  - `agentId` (string, required) – Workflow ID to execute.
  - `data` (string, optional) – Arbitrary payload to pass to the workflow.
- **Responses**:
  - `200 OK` – Workflow executed successfully (or queued, depending on implementation).
  - `500 Internal Server Error` – Workflow configuration missing or execution failed.

### POST /acharya/execute/bulk
- **Summary**: Execute an Acharya workflow for multiple customers in bulk.
- **Request body** (`AcharyaBulkExecuteRequest`):
  - `agentId` (string, required) – Workflow ID to execute.
  - `customer` (array, required) – List of customer objects:
    - `to` (string) – Destination identifier.
    - `data` (string, optional) – Payload per customer.
- **Responses**:
  - `200 OK` – Bulk workflows executed (when Kafka is disabled).
  - `202 Accepted` – Bulk workflows queued for async execution (when Kafka is enabled).
  - `500 Internal Server Error` – Workflow configuration missing or bulk execution failed.

---

## Workflow management endpoints

### GET /acharya/workflows/{workflowId}
- **Summary**: Get a single workflow by ID.
- **Path params**:
  - `workflowId` (string) – Acharya workflow ID.
- **Responses**:
  - `200 OK` – Workflow details returned.
  - `500 Internal Server Error` – Configuration missing or request failed.

### POST /acharya/workflows/{workflowId}/publish
- **Summary**: Publish a workflow.
- **Path params**:
  - `workflowId` (string) – Acharya workflow ID.
- **Responses**:
  - `200 OK` – Workflow published.
  - `500 Internal Server Error` – Configuration missing or request failed.

### PUT /acharya/workflows/{workflowId}
- **Summary**: Update an existing workflow.
- **Path params**:
  - `workflowId` (string) – Acharya workflow ID.
- **Request body** (`AcharyaCreateWorkflowRequest`):
  - `name` (string, required).
  - `description` (string, optional).
  - `steps` (array of objects, required) – Arbitrary step definitions; structure is proxied directly to Acharya.
- **Responses**:
  - `200 OK` – Workflow updated.
  - `500 Internal Server Error` – Configuration missing or request failed.

### GET /acharya/workflows/cards
- **Summary**: List workflow "cards" (summary representations).
- **Responses**:
  - `200 OK` – Workflow cards returned.
  - `500 Internal Server Error` – Configuration missing or request failed.

### GET /acharya/workflows
- **Summary**: List workflows.
- **Query params**:
  - `page` (integer, optional) – Page number.
  - `limit` (integer, optional) – Page size.
- **Responses**:
  - `200 OK` – Paginated list of workflows.
  - `500 Internal Server Error` – Configuration missing or request failed.

### POST /acharya/workflows
- **Summary**: Create a new workflow.
- **Request body** (`AcharyaCreateWorkflowRequest`):
  - `name` (string, required).
  - `description` (string, optional).
  - `steps` (array of objects, required) – Workflow step definitions.
- **Responses**:
  - `201 Created` – Workflow created.
  - `500 Internal Server Error` – Configuration missing or request failed.

---

## Execution status endpoint

### GET /acharya/status/{logId}
- **Summary**: Get execution status by log ID.
- **Path params**:
  - `logId` (string) – `AcharyaLog` MongoDB ID returned from the execute endpoint.
- **Responses**:
  - `200 OK` – Execution status returned.
  - `404 Not Found` – Execution not found.
