"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  taskPriorities,
  taskProgress,
  type Task,
  type TaskAction,
} from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type Editor = { task?: Task; parent?: Task; id: string };
type Filter = "all" | "pending" | "completed";

export function TasksManager({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () =>
      new Set(
        initialTasks
          .filter((task) => !task.parent_id)
          .slice(1)
          .map((task) => task.id),
      ),
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normal");
  const progress = taskProgress(tasks);
  const roots = tasks.filter((task) => !task.parent_id);
  const children = (id: string) =>
    tasks.filter((task) => task.parent_id === id);
  const matchesText = (task: Task) =>
    !search.trim() ||
    `${task.title} ${task.description}`
      .toLocaleLowerCase("ar")
      .includes(search.trim().toLocaleLowerCase("ar"));
  const matchesStatus = (task: Task) =>
    filter === "all" ||
    (filter === "completed" ? task.completed : !task.completed);
  const matched = (task: Task) => matchesText(task) && matchesStatus(task);
  const visible = roots.filter(
    (task) => matched(task) || children(task.id).some(matched),
  );

  const refresh = useCallback(async (quiet = false) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/board/tasks", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTasks(data.tasks);
      if (!quiet) {
        setError("");
        setNotice("تم تحديث قائمة المهام.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر تحديث المهام.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    function onFocus() {
      if (!editor && !deleting) void refresh(true);
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh, editor, deleting]);

  function openEditor(task?: Task, parent?: Task) {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? parent?.priority ?? "normal");
    setEditor({ task, parent, id: task?.id ?? crypto.randomUUID() });
    setError("");
  }

  async function mutate(action: TaskAction, payload: Record<string, unknown>) {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/board/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر حفظ التغيير.");
      setTasks(data.tasks);
      setNotice(action === "delete" ? "تم حذف المهمة." : "تم حفظ التغيير.");
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر حفظ التغيير.");
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const saved = await mutate(editor.task ? "update" : "create", {
      id: editor.id,
      title,
      description,
      priority,
      ...(editor.task ? { revision: editor.task.revision } : {}),
      ...(editor.parent
        ? {
            parent_id: editor.parent.id,
            parent_revision: editor.parent.revision,
          }
        : {}),
    });
    if (saved) {
      if (editor.parent)
        setCollapsed((old) => {
          const next = new Set(old);
          next.delete(editor.parent!.id);
          return next;
        });
      setEditor(null);
    }
  }

  function completion(task: Task, subtasks: Task[] = []) {
    const partial =
      !task.completed && subtasks.some((child) => child.completed);
    return (
      <Checkbox
        className="task-completion"
        checked={task.completed}
        indeterminate={partial}
        disabled={busy}
        aria-label={`${task.completed ? "إعادة فتح" : "إكمال"} ${task.title}${subtasks.length ? " وكل مهامها الفرعية" : ""}`}
        onCheckedChange={() =>
          void mutate("toggle", {
            id: task.id,
            revision: task.revision,
            completed: !task.completed,
          })
        }
      />
    );
  }

  function actions(task: Task) {
    return (
      <div className="task-actions">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={`تعديل ${task.title}`}
          title="تعديل المهمة"
          onClick={() => openEditor(task)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={`حذف ${task.title}`}
          title="حذف المهمة"
          onClick={() => {
            setError("");
            setDeleting(task);
          }}
        >
          <Trash2 />
        </Button>
      </div>
    );
  }

  return (
    <main className="tasks-manager container">
      <header className="tasks-page-header">
        <div>
          <span className="section-kicker">من الخطة إلى التنفيذ</span>
          <h1>المهام القادمة</h1>
          <p>
            خطوات نرفد القادمة في مكان واحد. أنجز كل خطوة، وتابع تقدم الفريق.
          </p>
        </div>
        <Button disabled={busy} onClick={() => openEditor()}>
          <Plus data-icon="inline-start" />
          إضافة مهمة
        </Button>
      </header>
      <section className="tasks-overview" aria-label="ملخص التقدم">
        <div>
          <span>الخطوات المكتملة</span>
          <strong>
            {progress.completed}
            <small> / {progress.total}</small>
          </strong>
        </div>
        <div>
          <span>المهام الرئيسية</span>
          <strong>{roots.length}</strong>
        </div>
        <div className="tasks-total-progress">
          <span>
            التقدم العام <strong>{progress.percentage}٪</strong>
          </span>
          <progress
            max={100}
            value={progress.percentage}
            aria-label="التقدم العام"
          />
        </div>
      </section>
      <div className="tasks-toolbar">
        <ToggleGroup
          value={[filter]}
          onValueChange={(values) => {
            if (values[0]) {
              setFilter(values[0] as Filter);
              setCollapsed(new Set());
            }
          }}
          variant="outline"
          size="sm"
          aria-label="تصفية المهام"
        >
          <ToggleGroupItem value="all">الكل</ToggleGroupItem>
          <ToggleGroupItem value="pending">غير مكتملة</ToggleGroupItem>
          <ToggleGroupItem value="completed">مكتملة</ToggleGroupItem>
        </ToggleGroup>
        <Field className="task-search">
          <FieldLabel htmlFor="task-search" className="sr-only">
            البحث في المهام
          </FieldLabel>
          <Input
            id="task-search"
            placeholder="ابحث عن مهمة…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (event.target.value.trim()) setCollapsed(new Set());
            }}
          />
        </Field>
        <Button
          variant="outline"
          size="icon"
          aria-label="تحديث المهام"
          title="تحديث المهام"
          disabled={busy}
          onClick={() => void refresh()}
        >
          <RefreshCw />
        </Button>
      </div>
      <p className="tasks-hint">
        تحديد المهمة الرئيسية يحدّد كل خطواتها. نسبة التقدم تحسب الخطوات الفرعية
        دون احتسابها مرتين.
      </p>
      {error && !editor && !deleting && (
        <Alert variant="destructive">
          <AlertTitle>تعذر تنفيذ التغيير</AlertTitle>
          <AlertDescription>
            {error}{" "}
            <button
              type="button"
              className="underline"
              onClick={() => void refresh()}
            >
              تحديث القائمة
            </button>
          </AlertDescription>
        </Alert>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {busy ? "جارٍ حفظ التغيير أو تحميل المهام…" : notice}
      </span>
      <section className="tasks-list" aria-label="قائمة المهام">
        {visible.map((task) => {
          const subtasks = children(task.id);
          const done = subtasks.filter((child) => child.completed).length;
          const expanded = !collapsed.has(task.id);
          const shownSubtasks = subtasks.filter(
            (child) =>
              matchesStatus(child) && (matchesText(task) || matchesText(child)),
          );
          return (
            <Card
              key={task.id}
              className={cn("task-card", task.completed && "task-is-completed")}
              data-task-id={task.id}
            >
              <CardHeader className="task-card-header">
                <div className="task-heading">
                  {completion(task, subtasks)}
                  <div>
                    <CardTitle as="h2">{task.title}</CardTitle>
                    <div className="task-meta">
                      <Badge variant={task.completed ? "default" : "secondary"}>
                        {task.completed ? (
                          <>
                            <Check /> مكتملة
                          </>
                        ) : (
                          `${done} من ${subtasks.length || 1} خطوة`
                        )}
                      </Badge>
                      <Badge variant="outline">
                        أولوية {taskPriorities[task.priority]}
                      </Badge>
                    </div>
                  </div>
                </div>
                {actions(task)}
                {task.description && (
                  <CardDescription className="task-description">
                    {task.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="task-card-content">
                <div className="task-subtasks-toolbar">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => openEditor(undefined, task)}
                  >
                    <Plus data-icon="inline-start" />
                    إضافة مهمة فرعية
                  </Button>
                  {subtasks.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${expanded ? "طي" : "عرض"} خطوات ${task.title}`}
                      aria-expanded={expanded}
                      aria-controls={`steps-${task.id}`}
                      onClick={() =>
                        setCollapsed((old) => {
                          const next = new Set(old);
                          if (next.has(task.id)) next.delete(task.id);
                          else next.add(task.id);
                          return next;
                        })
                      }
                    >
                      {expanded ? (
                        <ChevronDown data-icon="inline-start" />
                      ) : (
                        <ChevronLeft data-icon="inline-start" />
                      )}
                      {done} / {subtasks.length}
                    </Button>
                  )}
                </div>
                {expanded && subtasks.length > 0 && (
                  <ul id={`steps-${task.id}`} className="task-subtasks">
                    {shownSubtasks.map((child) => (
                      <li
                        key={child.id}
                        data-task-id={child.id}
                        className={cn(
                          "task-subtask",
                          child.completed && "task-is-completed",
                        )}
                      >
                        {completion(child)}
                        <div className="task-subtask-copy">
                          <h3>{child.title}</h3>
                          {child.description && <p>{child.description}</p>}
                        </div>
                        {actions(child)}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!visible.length && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListChecks />
              </EmptyMedia>
              <EmptyTitle>
                {tasks.length ? "لا توجد مهام مطابقة" : "ابدأ بمهمتك الأولى"}
              </EmptyTitle>
              <EmptyDescription>
                {tasks.length
                  ? "غيّر البحث أو التصفية لعرض مهام أخرى."
                  : "أضف مهمة رئيسية، ثم قسّمها إلى خطوات صغيرة."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open && !busyRef.current) setEditor(null);
        }}
      >
        <DialogContent
          className="task-dialog"
          dir="rtl"
          showCloseButton={!busy}
        >
          <DialogHeader>
            <DialogTitle>
              {editor?.task
                ? "تعديل المهمة"
                : editor?.parent
                  ? "إضافة مهمة فرعية"
                  : "إضافة مهمة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {editor?.parent
                ? `تحت: ${editor.parent.title}`
                : "اكتب خطوة واضحة، وأضف تفاصيل تساعد الفريق على تنفيذها."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="task-form">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="task-title">عنوان المهمة</FieldLabel>
                <Input
                  autoFocus
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                  required
                  disabled={busy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="task-description">
                  التفاصيل ومعيار الإنجاز
                </FieldLabel>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={6000}
                  rows={5}
                  disabled={busy}
                />
                <FieldDescription>
                  ما المطلوب؟ وكيف نعرف أن المهمة انتهت؟
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel id="task-priority-label">الأولوية</FieldLabel>
                <ToggleGroup
                  disabled={busy}
                  aria-labelledby="task-priority-label"
                  value={[priority]}
                  onValueChange={(values) => {
                    if (values[0]) setPriority(values[0] as Task["priority"]);
                  }}
                  variant="outline"
                  size="sm"
                >
                  {Object.entries(taskPriorities).map(([key, label]) => (
                    <ToggleGroupItem key={key} value={key}>
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            </FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="submit" disabled={busy || !title.trim()}>
                {busy && (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                حفظ المهمة
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setEditor(null)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busyRef.current) setDeleting(null);
        }}
      >
        <DialogContent dir="rtl" showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle>حذف المهمة؟</DialogTitle>
            <DialogDescription>
              سيتم حذف «{deleting?.title}»
              {deleting && children(deleting.id).length
                ? ` ومعها ${children(deleting.id).length} مهمة فرعية`
                : ""}
              . لا يمكن التراجع عن الحذف.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                if (
                  deleting &&
                  (await mutate("delete", {
                    id: deleting.id,
                    revision: deleting.revision,
                  }))
                )
                  setDeleting(null);
              }}
            >
              تأكيد الحذف
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
