import { Suspense } from "react";
import { AuthScreen } from "@/components/auth-screen";
export const metadata = { title: "Join Mzansi Collab" };
async function Signup({ searchParams }: { searchParams: Promise<{ ref?: string; role?: string }> }) { const { ref,role } = await searchParams; return <AuthScreen mode="signup" initialRole={role==="business"?"business":"creator"} referral={/^[a-f0-9]{12}$/.test(ref || "") ? ref : ""} />; }
export default function Page(props: { searchParams: Promise<{ ref?: string; role?: string }> }) { return <Suspense fallback={<p className="loading">Loading sign-up…</p>}><Signup {...props} /></Suspense>; }
