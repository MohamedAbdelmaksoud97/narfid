export type Task = {
  id: string;
  parent_id: string | null;
  title: string;
  description: string;
  priority: "high" | "normal" | "low";
  completed: boolean;
  sort_order: number;
  revision: number;
  created_at: string;
  updated_at: string;
};

export const taskPriorities = {
  high: "عالية",
  normal: "متوسطة",
  low: "منخفضة",
} as const;
export type TaskAction = "create" | "update" | "toggle" | "delete";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateTaskAction(
  action: string,
  input: Record<string, unknown>,
) {
  if (!["create", "update", "toggle", "delete"].includes(action))
    throw new Error("نوع العملية غير صالح.");
  if (typeof input.id !== "string" || !uuid.test(input.id))
    throw new Error("معرّف المهمة غير صالح.");
  const payload: Record<string, unknown> = { id: input.id };
  if (action !== "create") {
    if (!Number.isSafeInteger(input.revision) || Number(input.revision) < 1)
      throw new Error("إصدار المهمة غير صالح. حدّث القائمة.");
    payload.revision = input.revision;
  }
  if (action === "create" || action === "update") {
    if (
      typeof input.title !== "string" ||
      !input.title.trim() ||
      [...input.title.trim()].length > 200
    )
      throw new Error("اكتب عنوانًا للمهمة لا يتجاوز ٢٠٠ حرف.");
    if (
      typeof input.description !== "string" ||
      [...input.description].length > 6000
    )
      throw new Error("وصف المهمة لا يتجاوز ٦٠٠٠ حرف.");
    if (
      typeof input.priority !== "string" ||
      !Object.hasOwn(taskPriorities, input.priority)
    )
      throw new Error("أولوية المهمة غير صالحة.");
    Object.assign(payload, {
      title: input.title.trim(),
      description: input.description.trim(),
      priority: input.priority,
    });
  }
  if (action === "create" && input.parent_id != null) {
    if (
      typeof input.parent_id !== "string" ||
      !uuid.test(input.parent_id) ||
      input.parent_id === input.id
    )
      throw new Error("المهمة الرئيسية غير صالحة.");
    if (
      !Number.isSafeInteger(input.parent_revision) ||
      Number(input.parent_revision) < 1
    )
      throw new Error("إصدار المهمة الرئيسية غير صالح.");
    Object.assign(payload, {
      parent_id: input.parent_id,
      parent_revision: input.parent_revision,
    });
  }
  if (action === "toggle") {
    if (typeof input.completed !== "boolean")
      throw new Error("حالة الإنجاز غير صالحة.");
    payload.completed = input.completed;
  }
  return payload;
}

export function taskProgress(tasks: Task[]) {
  const parents = new Set(tasks.map((task) => task.parent_id).filter(Boolean));
  // Count executable steps once; a parent with children is an aggregate.
  const steps = tasks.filter((task) => !parents.has(task.id));
  const completed = steps.filter((task) => task.completed).length;
  return {
    total: steps.length,
    completed,
    percentage: steps.length ? Math.round((completed / steps.length) * 100) : 0,
  };
}
