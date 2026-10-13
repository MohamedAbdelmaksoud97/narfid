"use client";

import { useActionState, useState } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { loginAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LoginState } from "@/lib/auth/types";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <DirectionProvider direction="rtl">
      <form action={formAction} className="board-login-form">
        <FieldGroup>
          <Field data-invalid={Boolean(state.error)}>
            <FieldLabel htmlFor="board-email">البريد الإلكتروني</FieldLabel>
            <Input
              id="board-email"
              name="email"
              type="email"
              dir="ltr"
              placeholder="name@nerfed.example"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              defaultValue={state.email ?? ""}
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "login-error" : undefined}
              disabled={pending}
            />
          </Field>
          <Field data-invalid={Boolean(state.error)}>
            <div className="password-label">
              <FieldLabel htmlFor="board-password">كلمة المرور</FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                disabled={pending}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <Input
              id="board-password"
              name="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoComplete="current-password"
              required
              maxLength={256}
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "login-error" : undefined}
              disabled={pending}
            />
          </Field>
          {state.error && (
            <Alert variant="destructive" id="login-error">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <Button
              type="submit"
              size="marketing"
              className="w-full"
              disabled={pending}
            >
              {pending ? (
                <>
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                  جارٍ تسجيل الدخول
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft data-icon="inline-end" />
                </>
              )}
            </Button>
            <FieldDescription>
              الدخول متاح للحسابات المخصّصة لأعضاء مجلس الإدارة.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </DirectionProvider>
  );
}
