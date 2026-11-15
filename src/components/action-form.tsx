"use client";
import { useActionState } from "react";
import type { ReactNode } from "react";
import type { ActionState } from "@/lib/platform";

export function ActionForm({ action, children, submit, className = "", disabled = false }: { action: (state: ActionState, form: FormData) => Promise<ActionState>; children?: ReactNode; submit: string; className?: string; disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return <form action={formAction} className={`platform-form ${className}`}>
    <fieldset disabled={pending || disabled}>{children}<button className="button button-gold" type="submit">{pending ? "Working…" : submit}</button></fieldset>
    {state.message && <p className={`form-message ${state.ok ? "success" : ""}`} role="status">{state.message}</p>}
  </form>;
}
