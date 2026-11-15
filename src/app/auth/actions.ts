"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActionState } from "@/lib/platform";

const unavailable = { message: "Account registration is being connected. Please try again once setup is complete." };
function credentials(form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  return { email, password };
}
export async function signup(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return unavailable;
  const { email, password } = credentials(form);
  const name = String(form.get("display_name") || "").trim();
  const role = String(form.get("role"));
  const referral = String(form.get("referral_code") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2 || name.length > 80 || password.length < 12 || password.length > 128 || !["creator","business"].includes(role) || (referral && !/^[a-f0-9]{12}$/.test(referral))) return { message: "Check your name, email, account type and referral code. Use a password of 12–128 characters." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${getSiteUrl()}/auth/callback`, data: { display_name: name, role, referral_code: role === "creator" ? referral : "" } } });
  if (error) return { message: error.status === 429 ? "Too many attempts. Please wait before trying again." : "We couldn’t create the account. Check your details or try logging in if you already registered." };
  if (data.session) redirect("/dashboard");
  return { ok: true, message: "Check your inbox to confirm your email. If you already have an account, log in or reset your password." };
}
export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return unavailable;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(form));
  if (error) return { message: "We couldn’t log you in. Check your email and password, and confirm your email first." };
  redirect("/dashboard");
}
export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
export async function forgotPassword(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return unavailable;
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(credentials(form).email, { redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password` });
  return { ok: true, message: "If that address has an account, a password reset link will arrive shortly." };
}
export async function resetPassword(_: ActionState, form: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return unavailable;
  const password = String(form.get("password") || "");
  if (password.length < 12 || password.length > 128 || password !== form.get("confirm_password")) return { message: "Use matching passwords of 12–128 characters." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Open a fresh password reset link from your email first." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { message: "This link may have expired. Request a new reset email." };
  await supabase.auth.signOut();
  redirect("/login?reset=1");
}
