import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import Image from "next/image";
import { ActionForm } from "@/components/action-form";
import { signup, login, forgotPassword, resetPassword } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AuthScreen({ mode, referral = "", notice = "", initialRole = "creator" }: { mode: "signup" | "login" | "forgot" | "reset"; referral?: string; notice?: string; initialRole?: "creator" | "business" }) {
  const title = { signup: "Your next chapter starts here.", login: "Welcome back to your people.", forgot: "Let’s get you back in.", reset: "Choose a new password." }[mode];
  const action = { signup, login, forgot: forgotPassword, reset: resetPassword }[mode];
  const submit = { signup: "Create account", login: "Log in", forgot: "Send reset link", reset: "Save new password" }[mode];
  return <main className="auth-screen">
    <aside className="auth-story"><BrandLogo priority /><div><p className="eyebrow">Creators. Brands. Opportunity.</p><h2>Bring your ambition.<br /><em>Find your people.</em></h2><p>A professional home for South Africa’s creative community.</p><Image src="/images/creator-duo.png" alt="Illustrative pair of creators working together" width={600} height={450} /></div></aside>
    <section className="auth-panel"><Link className="subtle-link" href="/">← Back to Mzansi Collab</Link><h1>{title}</h1>
      {notice && <p className="form-message" role="status">{notice}</p>}
      {!isSupabaseConfigured() && <p className="form-message">Account setup is in progress. Registration will open when the database is connected.</p>}
      <ActionForm action={action} submit={submit} disabled={!isSupabaseConfigured()}>
        {mode === "signup" && <><label>Your name or business name<input name="display_name" required minLength={2} maxLength={80} autoComplete="name" /></label><label>I am joining as<select name="role" required defaultValue={initialRole}><option value="creator">Creator / influencer</option><option value="business">Brand / business</option></select></label></>}
        {mode !== "reset" && <label>Email address<input type="email" name="email" required autoComplete="email" maxLength={254} /></label>}
        {mode !== "forgot" && <label>Password<input type="password" name="password" required minLength={mode === "login" ? 1 : 12} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} /><small>{mode !== "login" && "Use at least 12 characters."}</small></label>}
        {mode === "reset" && <label>Confirm password<input type="password" name="confirm_password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>}
        {mode === "signup" && <><label>Creator referral code <span>(optional)</span><input name="referral_code" defaultValue={referral} maxLength={12} autoComplete="off" /></label><p className="field-help">Your email stays private. You choose when to publish your profile. Tokens are earned platform credits for creators, with no cash value.</p></>}
      </ActionForm>
      <div className="auth-links">{mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link><p>New here? <Link href="/signup">Create an account →</Link></p></> : <Link href="/login">Already registered? Log in →</Link>}</div>
    </section>
  </main>;
}
