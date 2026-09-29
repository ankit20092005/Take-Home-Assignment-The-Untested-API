# Bug Report

I identified three bugs during the testing phase. Each bug was
first reproduced through an automated test before applying the fix.

---

## Bug #1 — Pagination starts from the wrong page

### Location

`src/services/taskService.js`

### Endpoint affected

`GET /tasks?page=1&limit=2`

### Expected behavior

When requesting:

`GET /tasks?page=1&limit=2`

the API should return the first two tasks.

For example, if the tasks are:

- Task 1
- Task 2
- Task 3

the first page with a limit of two should return:

- Task 1
- Task 2

### Actual behavior

The API returned only Task 3.

### How I discovered it

I wrote an integration test using Supertest that created three
tasks and requested the first page with a limit of two.

The test expected two tasks but received only one task.

### Root cause

The pagination offset was calculated as:

```js
const offset = page * limit;