# Submission Notes

## What I Would Test Next

If I had more time, I would add tests for:

- Completing an already completed task.
- Additional combinations of pagination parameters.
- Boundary cases for page and limit values.
- Additional date-related edge cases.
- Unexpected errors from the service layer.
- More combinations of fields during task updates.
- Concurrent requests that modify the same task.

I would also consider adding tests for the behavior of the API
when requests contain unexpected or additional fields.

---

## What Surprised Me

The existing API had no automated tests, but behavior-focused
testing revealed several issues that were not immediately obvious
from the API documentation.

In particular:

1. Pagination started from the wrong item because the page number
   was treated as zero-based internally even though the API used
   one-based page numbers.

2. Status filtering used a partial string match, which caused a
   filter such as `status=do` to match tasks with status `todo`.

3. Completing a task unexpectedly changed its priority to
   `medium`, even when the task originally had a different
   priority.

Writing tests first made these issues easier to reproduce and
understand before changing the implementation.

---

## Questions I Would Ask Before Shipping to Production

### Data persistence

The current implementation uses an in-memory data store, so all
tasks are lost whenever the server restarts.

I would ask whether the production version should use a persistent
database.

### Authentication and authorization

I would ask whether users need to authenticate and whether users
should only be allowed to view or modify tasks that they are
authorized to access.

### Assignees

I would ask whether an assignee should be a free-form name or
whether it should reference an actual registered user.

### Reassignment

I would ask whether all users are allowed to reassign tasks or
whether reassignment should be restricted based on user roles or
permissions.

### Pagination

I would ask whether there should be maximum limits for the
`page` and `limit` parameters to prevent unnecessarily large
requests.

### Completed tasks

I would ask whether completed tasks can still be edited and
whether completing an already completed task should update
`completedAt` again.

### Error handling and monitoring

Before production, I would also want to clarify the expected
logging, monitoring, error tracking, and API observability
requirements.