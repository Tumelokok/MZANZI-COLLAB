import { Suspense } from "react";
import { AuthScreen } from "@/components/auth-screen";
export const metadata = { title: "Log in | Mzansi Collab" };
async function Login({ searchParams }: { searchParams: Promise<Record<string,string>> }) { const p = await searchParams; const notice = p.expired ? "That link expired or could not be verified. Try signing in or request a new reset link." : p.reset ? "Password updated. Log in with your new password." : p.confirm ? "Confirm your email before opening your dashboard." : ""; return <AuthScreen mode="login" notice={notice} />; }
export default function Page(props: { searchParams: Promise<Record<string,string>> }) { return <Suspense fallback={<p className="loading">Loading login…</p>}><Login {...props} /></Suspense>; }
