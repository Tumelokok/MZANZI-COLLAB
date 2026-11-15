import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/platform";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), getSiteUrl()));
  }
  return NextResponse.redirect(new URL("/login?expired=1", getSiteUrl()));
}
