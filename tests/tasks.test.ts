import { test } from "node:test";
import assert from "node:assert/strict";
import { taskProgress, validateTaskAction, type Task } from "../lib/tasks";

const id = "f1400000-0000-4000-8000-000000000001";
const parent_id = "f1400000-0000-4000-8000-000000000002";
test("task validation trims input and excludes fields the caller cannot change", () => {
  assert.deepEqual(
    validateTaskAction("create", {
      id,
      title: "  مهمة  ",
      description: " تفاصيل ",
      priority: "high",
      completed: true,
      revision: 99,
    }),
    { id, title: "مهمة", description: "تفاصيل", priority: "high" },
  );
  assert.deepEqual(
    validateTaskAction("toggle", { id, revision: 2, completed: false }),
    { id, revision: 2, completed: false },
  );
});
test("task validation rejects malformed input, stale revision shapes and invalid parent links", () => {
  const draft = { id, title: "عنوان", description: "", priority: "normal" };
  for (const payload of [
    { ...draft, title: " " },
    { ...draft, title: "ع".repeat(201) },
    { ...draft, description: "ع".repeat(6001) },
    { ...draft, priority: "toString" },
    { ...draft, parent_id: id, parent_revision: 1 },
    { ...draft, parent_id, parent_revision: 0 },
  ])
    assert.throws(() => validateTaskAction("create", payload));
  assert.throws(() => validateTaskAction("delete", { id, revision: 0 }));
  assert.throws(() =>
    validateTaskAction("toggle", { id, revision: 1, completed: "true" }),
  );
  assert.throws(() => validateTaskAction("publish", draft));
});
test("progress counts leaf steps once and includes standalone tasks", () => {
  const task = (value: Partial<Task>) =>
    ({ id, parent_id: null, completed: false, ...value }) as Task;
  assert.deepEqual(taskProgress([]), { total: 0, completed: 0, percentage: 0 });
  assert.deepEqual(
    taskProgress([
      task({ id: parent_id }),
      task({ parent_id, completed: true }),
      task({ id: "child-2", parent_id }),
      task({ id: "standalone", completed: true }),
    ]),
    { total: 3, completed: 2, percentage: 67 },
  );
});
