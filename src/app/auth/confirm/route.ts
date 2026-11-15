import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (hash && (type === "email" || type === "recovery") && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/reset-password" : "/dashboard", getSiteUrl()));
  }
  return NextResponse.redirect(new URL("/login?expired=1", getSiteUrl()));
}
