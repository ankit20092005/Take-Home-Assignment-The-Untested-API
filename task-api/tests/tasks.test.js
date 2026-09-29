const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

describe("Task API", () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe("POST /tasks", () => {
    test("should create a task", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Learn Supertest",
          description: "Write API tests",
          priority: "high",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Learn Supertest");
      expect(response.body.priority).toBe("high");
      expect(response.body.status).toBe("todo");
    });

    test("should reject a task without a title", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          priority: "high",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    test("should reject invalid status", async () => {
        const response = await request(app)
            .post("/tasks")
            .send({
            title: "Invalid status task",
            status: "invalid",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("status must be one of");
        });

        test("should reject invalid priority", async () => {
        const response = await request(app)
            .post("/tasks")
            .send({
            title: "Invalid priority task",
            priority: "urgent",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("priority must be one of");
        });

        test("should reject invalid due date", async () => {
        const response = await request(app)
            .post("/tasks")
            .send({
            title: "Invalid date task",
            dueDate: "not-a-date",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "dueDate must be a valid ISO date string"
        );
    });
  });

  describe("GET /tasks", () => {
    test("should handle invalid pagination values", async () => {
        await request(app)
            .post("/tasks")
            .send({ title: "Task 1" });

        const response = await request(app)
            .get("/tasks")
            .query({
            page: -1,
            limit: 2,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("should not return tasks for a partial status", async () => {
        await request(app)
            .post("/tasks")
            .send({
            title: "Todo task",
            status: "todo",
            });

        const response = await request(app)
            .get("/tasks")
            .query({ status: "do" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    test("should return all tasks", async () => {
      await request(app)
        .post("/tasks")
        .send({ title: "Task 1" });

      await request(app)
        .post("/tasks")
        .send({ title: "Task 2" });

      const response = await request(app).get("/tasks");

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test("should filter tasks by status", async () => {
      await request(app)
        .post("/tasks")
        .send({
          title: "Todo task",
          status: "todo",
        });

      await request(app)
        .post("/tasks")
        .send({
          title: "Done task",
          status: "done",
        });

      const response = await request(app)
        .get("/tasks")
        .query({ status: "todo" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe("todo");
    });

    test("should support pagination", async () => {
      await request(app)
        .post("/tasks")
        .send({ title: "Task 1" });

      await request(app)
        .post("/tasks")
        .send({ title: "Task 2" });

      await request(app)
        .post("/tasks")
        .send({ title: "Task 3" });

      const response = await request(app)
        .get("/tasks")
        .query({
          page: 1,
          limit: 2,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("PUT /tasks/:id", () => {
    test("should reject empty title", async () => {
        const created = await request(app)
            .post("/tasks")
            .send({
            title: "Original title",
            });

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({
            title: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("title must be a non-empty string");
        });

        test("should reject invalid status", async () => {
        const created = await request(app)
            .post("/tasks")
            .send({
            title: "Task",
            });

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({
            status: "invalid",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("status must be one of");
        });

        test("should reject invalid priority", async () => {
        const created = await request(app)
            .post("/tasks")
            .send({
            title: "Task",
            });

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({
            priority: "urgent",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain("priority must be one of");
        });

        test("should reject invalid due date", async () => {
        const created = await request(app)
            .post("/tasks")
            .send({
            title: "Task",
            });

        const response = await request(app)
            .put(`/tasks/${created.body.id}`)
            .send({
            dueDate: "not-a-date",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "dueDate must be a valid ISO date string"
        );
        });

    test("should update a task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({
          title: "Old title",
        });

      const response = await request(app)
        .put(`/tasks/${created.body.id}`)
        .send({
          title: "New title",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe("New title");
    });

    test("should return 404 for nonexistent task", async () => {
      const response = await request(app)
        .put("/tasks/nonexistent-id")
        .send({
          title: "New title",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("DELETE /tasks/:id", () => {
    test("should delete a task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({
          title: "Delete me",
        });

      const response = await request(app)
        .delete(`/tasks/${created.body.id}`);

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app).get("/tasks");

      expect(getResponse.body).toHaveLength(0);
    });

    test("should return 404 for nonexistent task", async () => {
      const response = await request(app)
        .delete("/tasks/nonexistent-id");

      expect(response.statusCode).toBe(404);
    });
  });

  describe("PATCH /tasks/:id/complete", () => {
    test("should mark a task as completed", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({
          title: "Complete me",
          priority: "high",
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/complete`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("done");
      expect(response.body.completedAt).not.toBeNull();
    });

    test("should return 404 for nonexistent task", async () => {
      const response = await request(app)
        .patch("/tasks/nonexistent-id/complete");

      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /tasks/stats", () => {
    test("should return task statistics", async () => {
      await request(app)
        .post("/tasks")
        .send({
          title: "Todo task",
          status: "todo",
        });

      await request(app)
        .post("/tasks")
        .send({
          title: "Done task",
          status: "done",
        });

      const response = await request(app).get("/tasks/stats");

      expect(response.statusCode).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body.in_progress).toBe(0);
    });
  });
});

describe("PATCH /tasks/:id/assign", () => {
  test("should assign a task to a user", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "Ankit",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe("Ankit");
    expect(response.body.id).toBe(created.body.id);
  });

  test("should return 404 when task does not exist", async () => {
    const response = await request(app)
      .patch("/tasks/nonexistent-id/assign")
      .send({
        assignee: "Ankit",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  test("should reject missing assignee", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should reject empty assignee", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should reject whitespace-only assignee", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "   ",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should reject non-string assignee", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: 123,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should allow reassignment", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Reassign me",
      });

    await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "Ankit",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "Rahul",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe("Rahul");
  });
});