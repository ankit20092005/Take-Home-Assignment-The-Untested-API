const taskService = require("../src/services/taskService");

describe("Task Service", () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe("create()", () => {
    test("should create a task", () => {
      const task = taskService.create({
        title: "Learn Jest",
        priority: "high",
      });

      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("createdAt");
      expect(task.title).toBe("Learn Jest");
      expect(task.priority).toBe("high");
      expect(task.status).toBe("todo");
      expect(task.completedAt).toBeNull();
    });

    test("should use default values", () => {
      const task = taskService.create({
        title: "Default task",
      });

      expect(task.description).toBe("");
      expect(task.status).toBe("todo");
      expect(task.priority).toBe("medium");
      expect(task.dueDate).toBeNull();
    });
  });

  describe("getAll()", () => {
    test("should return all tasks", () => {
      taskService.create({ title: "Task 1" });
      taskService.create({ title: "Task 2" });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
    });

    test("should return empty array when there are no tasks", () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe("findById()", () => {
    test("should find a task by id", () => {
      const created = taskService.create({
        title: "Find me",
      });

      const task = taskService.findById(created.id);

      expect(task).toBeDefined();
      expect(task.id).toBe(created.id);
    });

    test("should return undefined for a nonexistent task", () => {
      const task = taskService.findById("invalid-id");

      expect(task).toBeUndefined();
    });
  });

  describe("getByStatus()", () => {
    test("should return tasks matching the status", () => {
      taskService.create({
        title: "Todo task",
        status: "todo",
      });

      taskService.create({
        title: "Done task",
        status: "done",
      });

      const result = taskService.getByStatus("todo");

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("todo");
    });

    test("should return empty array when no tasks match", () => {
      taskService.create({
        title: "Todo task",
        status: "todo",
      });

      const result = taskService.getByStatus("done");

      expect(result).toEqual([]);
    });
  });

  describe("getPaginated()", () => {
    test("should return the first page", () => {
        taskService.create({ title: "Task 1" });
        taskService.create({ title: "Task 2" });
        taskService.create({ title: "Task 3" });

        const result = taskService.getPaginated(1, 2);

        expect(result).toHaveLength(2);
        expect(result[0].title).toBe("Task 1");
        expect(result[1].title).toBe("Task 2");
    });

    test("should return the second page", () => {
        taskService.create({ title: "Task 1" });
        taskService.create({ title: "Task 2" });
        taskService.create({ title: "Task 3" });

        const result = taskService.getPaginated(2, 2);

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe("Task 3");
    });
    });

  describe("update()", () => {
    test("should update an existing task", () => {
      const created = taskService.create({
        title: "Old title",
      });

      const updated = taskService.update(created.id, {
        title: "New title",
      });

      expect(updated.title).toBe("New title");
      expect(updated.id).toBe(created.id);
    });

    test("should return null for a nonexistent task", () => {
      const result = taskService.update("invalid-id", {
        title: "New title",
      });

      expect(result).toBeNull();
    });
  });

  describe("remove()", () => {
    test("should remove an existing task", () => {
      const created = taskService.create({
        title: "Delete me",
      });

      const result = taskService.remove(created.id);

      expect(result).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test("should return false for a nonexistent task", () => {
      const result = taskService.remove("invalid-id");

      expect(result).toBe(false);
    });
  });

  describe("completeTask()", () => {
    test("should preserve task priority when completing", () => {
        const created = taskService.create({
            title: "Important task",
            priority: "high",
        });

        const completed = taskService.completeTask(created.id);

        expect(completed.status).toBe("done");
        expect(completed.priority).toBe("high");
        expect(completed.completedAt).not.toBeNull();
    });

    test("should mark a task as completed", () => {
      const created = taskService.create({
        title: "Complete me",
        priority: "high",
      });

      const completed = taskService.completeTask(created.id);

      expect(completed.status).toBe("done");
      expect(completed.completedAt).not.toBeNull();
    });

    test("should return null for a nonexistent task", () => {
      const result = taskService.completeTask("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("getStats()", () => {
    test("should count tasks by status", () => {
      taskService.create({
        title: "Todo",
        status: "todo",
      });

      taskService.create({
        title: "In progress",
        status: "in_progress",
      });

      taskService.create({
        title: "Done",
        status: "done",
      });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
    });

    test("should return zero counts when there are no tasks", () => {
      const stats = taskService.getStats();

      expect(stats.todo).toBe(0);
      expect(stats.in_progress).toBe(0);
      expect(stats.done).toBe(0);
      expect(stats.overdue).toBe(0);
    });
  });

  describe("assign()", () => {
    test("should assign a task to a user", () => {
        const created = taskService.create({
        title: "Assign me",
        });

        const updated = taskService.assign(created.id, "Ankit");

        expect(updated.assignee).toBe("Ankit");
        expect(updated.id).toBe(created.id);
    });

    test("should return null for a nonexistent task", () => {
        const result = taskService.assign(
        "nonexistent-id",
        "Ankit"
        );

        expect(result).toBeNull();
    });

    test("should allow reassignment", () => {
        const created = taskService.create({
        title: "Reassign me",
        });

        taskService.assign(created.id, "Ankit");

        const updated = taskService.assign(
        created.id,
        "Rahul"
        );

        expect(updated.assignee).toBe("Rahul");
    });
    });
});