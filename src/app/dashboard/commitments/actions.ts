"use server";

import { revalidatePath } from "next/cache";
import { requireAccount } from "@/lib/account";
import type { ActionState } from "@/lib/platform";

const path = "/dashboard/commitments";

export async function saveCommitment(_: ActionState, form: FormData): Promise<ActionState> {
  const { account, supabase } = await requireAccount();
  if (account.role !== "creator") return { message: "A creator account is required." };
  const id = String(form.get("id"));
  const brand = String(form.get("brand") ?? "").trim();
  const deliverable = String(form.get("deliverable") ?? "").trim();
  const due_date = String(form.get("due_date") ?? "");
  if (!brand || !deliverable || brand.length > 100 || deliverable.length > 200 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return { message: "Check the brand, deliverable and due date." };
  const fields = { brand, deliverable, due_date };
  const editing = form.get("mode") === "edit";
  const query = editing
    ? supabase.from("creator_commitments").update(fields).eq("id", id)
    : supabase.from("creator_commitments").insert({ id, ...fields });
  const { error } = await query.select("id").single();
  if (error) return { message: "Could not save this commitment. Refresh to check your list." };
  revalidatePath(path);
  return { ok: true, message: "Commitment saved." };
}

export async function setDelivery(_: ActionState, form: FormData): Promise<ActionState> {
  const { account, supabase } = await requireAccount();
  if (account.role !== "creator") return { message: "A creator account is required." };
  const { error } = await supabase.from("creator_commitments")
    .update({ delivered: form.get("delivered") === "yes" })
    .eq("id", String(form.get("id"))).select("id").single();
  if (error) return { message: "Could not update the delivery status." };
  revalidatePath(path);
  return { ok: true, message: "Delivery status updated." };
}
