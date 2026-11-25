import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function requireAccount() {
  // Private account reads and Supabase's session clock must run for a real request,
  // including when Cache Components speculatively prerenders a dashboard navigation.
  await connection();
  if (!isSupabaseConfigured()) redirect("/login?setup=1");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?confirm=1");
  const { data: account, error: accountError } = await supabase.from("accounts").select("*").eq("id", user.id).single();
  if (accountError || !account) throw new Error("Account setup is incomplete. Apply the platform database migration before signing up.");
  return { supabase, user, account };
}
