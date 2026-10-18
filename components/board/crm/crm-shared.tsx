"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { parseMoney } from "@/lib/crm/validation";
import type { FieldSpec } from "./crm-fields";

export class ApiError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}
export async function crmRequest(
  path: string,
  method = "GET",
  body?: object,
  root = "/api/board/crm",
) {
  const response = await fetch(`${root}${path ? `/${path}` : ""}`, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(data.error || "تعذر إتمام الطلب.", data.field);
  return data;
}
export function useCrmData<T>(path: string, root = "/api/board/crm") {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    try {
      const result = await crmRequest(path, "GET", undefined, root);
      if (current === generation.current) {
        setData(result);
        setError("");
      }
    } catch (error) {
      if (current === generation.current)
        setError(error instanceof Error ? error.message : "تعذر التحميل.");
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [path, root]);
  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    const active = generation;
    return () => {
      active.current++;
      window.clearTimeout(timer);
    };
  }, [reload]);
  return { data, error, loading, reload };
}
export function CrmStatus({
  error,
  loading,
  reload,
}: {
  error: string;
  loading: boolean;
  reload: () => void;
}) {
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button variant="outline" size="sm" disabled={loading} onClick={reload}>
        <RefreshCw data-icon="inline-start" />
        {loading ? "جارٍ التحديث…" : "تحديث البيانات"}
      </Button>
    </>
  );
}
export function NoRecords({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
export function CrmEditor({
  title,
  description,
  fields,
  initial,
  submitLabel = "حفظ",
  onFieldChange,
  onClose,
  onSave,
}: {
  title: string;
  description?: string;
  fields: FieldSpec[];
  initial: Record<string, unknown>;
  submitLabel?: string;
  onFieldChange?: (key: string, value: string) => Record<string, string>;
  onClose: () => void;
  onSave: (fields: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        initial[field.key] == null
          ? ""
          : field.type === "money"
            ? String(Number(initial[field.key]) / 100)
            : String(initial[field.key]),
      ]),
    ),
  );
  const [error, setError] = useState(""),
    [invalid, setInvalid] = useState(""),
    [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    setInvalid("");
    try {
      const body = { ...initial };
      for (const field of fields) {
        try {
          body[field.key] =
            field.type === "money"
              ? values[field.key] === "" && !field.required
                ? field.key === "annual_budget_cents" || field.nullable
                  ? null
                  : 0
                : parseMoney(values[field.key])
              : field.type === "number"
                ? /^\d+$/.test(values[field.key])
                  ? Number(values[field.key])
                  : NaN
                : values[field.key];
        } catch (error) {
          throw new ApiError(
            error instanceof Error ? error.message : "راجع القيمة.",
            field.key,
          );
        }
      }
      await onSave(body);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر الحفظ.");
      setInvalid(error instanceof ApiError ? (error.field ?? "") : "");
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="crm-editor" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ??
              "تُحفظ البيانات داخل مساحة الإدارة ويطّلع عليها أعضاء المجلس المخوّلون."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="crm-editor-form">
          <FieldGroup className="crm-form-grid">
            {fields.map((field) => {
              const id = `crm-field-${field.key}`,
                props = {
                  id,
                  name: field.key,
                  required: field.required,
                  disabled: pending,
                  value: values[field.key] ?? "",
                  "aria-invalid": invalid === field.key,
                  onChange: (
                    event: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                    >,
                  ) =>
                    setValues((old) => ({
                      ...old,
                      ...onFieldChange?.(field.key, event.target.value),
                      [field.key]: event.target.value,
                    })),
                };
              return (
                <Field
                  key={field.key}
                  data-wide={field.wide}
                  data-invalid={invalid === field.key}
                >
                  <FieldLabel htmlFor={id}>
                    {field.label}
                    {field.required && " *"}
                  </FieldLabel>
                  {field.options ? (
                    <NativeSelect {...props}>
                      {!("" in field.options) && (
                        <NativeSelectOption value="" disabled>
                          اختر…
                        </NativeSelectOption>
                      )}
                      {Object.entries(field.options).map(([key, label]) => (
                        <NativeSelectOption key={key} value={key}>
                          {label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  ) : field.type === "textarea" ? (
                    <Textarea {...props} rows={4} maxLength={10000} />
                  ) : (
                    <Input
                      {...props}
                      type={
                        field.type === "money" ? "text" : (field.type ?? "text")
                      }
                      inputMode={
                        field.type === "money"
                          ? "decimal"
                          : field.type === "number"
                            ? "numeric"
                            : undefined
                      }
                      min={field.type === "number" ? 1 : undefined}
                      dir={
                        ["email", "url", "money", "number", "date"].includes(
                          field.type ?? "",
                        ) || field.key === "phone"
                          ? "ltr"
                          : undefined
                      }
                    />
                  )}
                  {field.hint && (
                    <FieldDescription>{field.hint}</FieldDescription>
                  )}
                  {invalid === field.key && <FieldError>{error}</FieldError>}
                </Field>
              );
            })}
          </FieldGroup>
          {error && !invalid && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "جارٍ الحفظ…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function CrmConfirm({
  title,
  description,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await onConfirm();
                onClose();
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : "تعذر التنفيذ.",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "جارٍ التنفيذ…" : "تأكيد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
