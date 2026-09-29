# Task Manager API — Take-Home Assignment

A RESTful Task Manager API built with Node.js and Express.

This project was provided as an intentionally untested API. The
assignment involved understanding the existing codebase, writing
unit and integration tests, identifying and fixing bugs, and
implementing a new task-assignment feature.

## Tech Stack

- Node.js
- Express
- Jest
- Supertest
- UUID

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Start the server

```bash
npm start
```

The API runs on:

```text
http://localhost:3000
```

## Running Tests

Run the complete test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run coverage
```

### Test Results

Current test suite:

```text
50 tests passed
```

### Coverage

| Metric | Coverage |
|---|---:|
| Statements | 96.68% |
| Branches | 91.56% |
| Functions | 93.1% |
| Lines | 96.35% |

The project exceeds the assignment requirement of 80%+ coverage.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| GET | `/tasks?status=todo` | Filter tasks by status |
| GET | `/tasks?page=1&limit=10` | Paginate tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/complete` | Mark a task as completed |
| GET | `/tasks/stats` | Get task statistics |
| PATCH | `/tasks/:id/assign` | Assign a task to a user |

## Task Shape

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "todo | in_progress | done",
  "priority": "low | medium | high",
  "dueDate": "ISO string | null",
  "completedAt": "ISO string | null",
  "createdAt": "ISO string",
  "assignee": "string"
}
```

## New Feature — Assign Task

The following endpoint was implemented as part of the assignment:

```http
PATCH /tasks/:id/assign
```

Request:

```json
{
  "assignee": "Ankit"
}
```

The endpoint:

- Assigns a task to a user.
- Returns the updated task.
- Returns `404` if the task does not exist.
- Rejects missing assignees.
- Rejects empty or whitespace-only assignees.
- Rejects non-string assignees.
- Trims leading and trailing whitespace.
- Allows reassignment.

Example:

```bash
curl -X PATCH http://localhost:3000/tasks/<task-id>/assign \
  -H "Content-Type: application/json" \
  -d '{"assignee":"Ankit"}'
```

See `DESIGN.md` for the design decisions behind this feature.

## Bugs Found and Fixed

Three bugs were identified through automated testing.

### 1. Pagination off-by-one error

The first page of results skipped the first tasks because the
pagination offset used `page * limit` instead of
`(page - 1) * limit`.

### 2. Partial status matching

Status filtering used `String.includes()`, which allowed partial
values such as `do` to match the `todo` status.

### 3. Completion changed task priority

Completing a task unexpectedly changed its priority to `medium`.
The implementation was changed to preserve the existing priority.

See `BUG_REPORT.md` for the complete investigation and fixes.

## Testing Strategy

The test suite contains both unit and integration tests.

### Unit Tests

`tests/taskService.test.js`

Tests the task service functions directly, including:

- Task creation
- Task retrieval
- Status filtering
- Pagination
- Task updates
- Task deletion
- Task completion
- Statistics
- Task assignment

### Integration Tests

`tests/tasks.test.js`

Tests the API through HTTP requests using Supertest, including:

- Successful requests
- Validation errors
- Missing resources
- Pagination
- Status filtering
- Task completion
- Statistics
- Task assignment
- Reassignment

## Project Documentation

- `BUG_REPORT.md` — Bugs discovered, root causes, and fixes.
- `DESIGN.md` — Design decisions for the assignment feature.
- `NOTES.md` — Additional testing ideas and production questions.
- `ASSIGNMENT.md` — Original assignment requirements.

## Data Storage

The current application uses an in-memory data store.

This means all task data is reset whenever the server restarts.

A production version would likely require persistent storage.

## Live API

**To be added after deployment:**

```text
YOUR_LIVE_API_URL
```

## Repository

**GitHub:**

```text
YOUR_GITHUB_REPOSITORY_URL
```