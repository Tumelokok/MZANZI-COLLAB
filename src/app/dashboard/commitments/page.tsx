import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/action-form";
import { requireAccount } from "@/lib/account";
import { saveCommitment, setDelivery } from "./actions";

type Commitment = { id: string; brand: string; deliverable: string; due_date: string; delivered: boolean };

function Fields({ item }: { item?: Commitment }) {
  return <>
    <label>Brand<input name="brand" defaultValue={item?.brand} required maxLength={100} /></label>
    <label>Deliverable<input name="deliverable" defaultValue={item?.deliverable} required maxLength={200} /></label>
    <label>Due date<input type="date" name="due_date" defaultValue={item?.due_date} required /></label>
  </>;
}

async function Commitments() {
  const { account, supabase } = await requireAccount();
  if (account.role !== "creator") redirect("/dashboard");
  const { data, error } = await supabase.from("creator_commitments")
    .select("id,brand,deliverable,due_date,delivered").order("delivered").order("due_date").order("id");
  if (error) throw new Error("Could not load your commitments.");
  const items: Commitment[] = data ?? [];
  const newId = randomUUID();
  return <main className="workspace-main">
    <Link href="/dashboard">← Creator dashboard</Link>
    <h1>Brand commitments</h1>
    <p>Track each promised post, placement or review separately. Only you can see this list.</p>
    <section className="workspace-section">
      <h2>Add a commitment</h2>
      <ActionForm key={newId} action={saveCommitment} submit="Add commitment">
        <input type="hidden" name="id" value={newId} /><Fields />
      </ActionForm>
    </section>
    <section className="workspace-section">
      <h2>Your commitments</h2>
      {!items.length && <p>Your first commitment will appear here.</p>}
      {items.map(item => <article className="notice-card" key={item.id}>
        <h3>{item.brand} · {item.deliverable}</h3>
        <p>{item.delivered ? "Delivered" : "Open"} · Due <time dateTime={item.due_date}>{item.due_date}</time></p>
        <ActionForm action={setDelivery} submit={item.delivered ? "Reopen" : "Mark delivered"}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="delivered" value={item.delivered ? "no" : "yes"} />
        </ActionForm>
        <details><summary>Edit commitment</summary>
          <ActionForm action={saveCommitment} submit="Save changes">
            <input type="hidden" name="mode" value="edit" /><input type="hidden" name="id" value={item.id} />
            <Fields item={item} />
          </ActionForm>
        </details>
      </article>)}
    </section>
  </main>;
}

export default function Page() {
  return <Suspense fallback={<p>Loading commitments…</p>}><Commitments /></Suspense>;
}
