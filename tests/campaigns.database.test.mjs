import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

// Run the real migrations in isolated PostgreSQL with Supabase's auth/storage contracts.
// Each assertion changes the database role and JWT subject, not just a query filter.
test('private campaigns: lifecycle, owner isolation and payment integrity', async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email_confirmed_at timestamptz, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,storage to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text);
    alter table storage.objects enable row level security;
    grant select,insert,delete on storage.objects to authenticated;
    create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
  `);
  const migrations = new URL('../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(migrations)).filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(file, migrations), 'utf8'));
  }
  const [alice, bob, business, unconfirmed, admin] = Array.from({ length: 5 }, () => randomUUID());
  async function root(sql, params = []) { await db.exec('reset role'); return db.query(sql, params); }
  async function as(id, sql, params = []) {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id ?? '']);
    await db.exec(`set role ${id ? 'authenticated' : 'anon'}`);
    return db.query(sql, params);
  }
  for (const id of [alice, bob, business, unconfirmed, admin]) {
    await root('insert into auth.users values($1,$2,$3)', [id, id === unconfirmed ? null : new Date().toISOString(), JSON.stringify({ role: id === business ? 'business' : 'creator', display_name: 'Test member' })]);
  }
  await root('insert into public.platform_admins values($1)', [admin]);
  const create = (id, currency = 'ZAR', amount = 300000) => as(id, "select public.create_creator_campaign('Test brand','Launch deal',$1,$2,'2026-12-01','Private agreement') as id", [currency, amount]).then(r => r.rows[0].id);
  const add = (id, campaign, title, due) => as(id, 'select public.add_campaign_deliverable($1,$2,$3) as id', [campaign, title, due]).then(r => r.rows[0].id);
  const publish = (id, deliverable, value = true) => as(id, 'select public.set_campaign_deliverable_published($1,$2)', [deliverable, value]);
  const pay = (id, campaign, amount, key = randomUUID(), date = '2026-01-01', reference = 'Payment') => as(id, 'select public.record_campaign_payment($1,$2,$3,$4,$5) as id', [campaign, amount, date, reference, key]).then(r => r.rows[0].id);
  const summary = (id) => as(id, 'select * from public.creator_campaign_summary()').then(r => r.rows);
  let deal, first, second, deposit;

  await t.test('creator records a deal, deadlines and a partial payment', async () => {
    deal = await create(alice);
    first = await add(alice, deal, 'Instagram Reel', '2026-01-10');
    second = await add(alice, deal, 'YouTube video', '2026-01-12');
    deposit = await pay(alice, deal, 100000);
    const [row] = await summary(alice);
    assert.equal(row.currency, 'ZAR');
    assert.equal(Number(row.total_minor), 300000);
    assert.equal(Number(row.paid_minor), 100000, 'two deliverables must not multiply the payment total');
    assert.equal(Number(row.outstanding_minor), 200000);
    assert.equal(Number(row.open_deliverables), 2);
    assert.equal(row.next_due_on.toISOString().slice(0, 10), '2026-01-10');
    const owned = (await as(alice, 'select * from public.creator_campaigns where id=$1', [deal])).rows;
    assert.equal(owned[0].creator_id, alice, 'ownership is assigned from the authenticated session');
    assert.equal((await as(alice, 'select * from public.campaign_payments where id=$1', [deposit])).rows.length, 1);
  });

  await t.test('another creator cannot read known campaign, payment or deliverable IDs, or summaries', async () => {
    const bobDeal = await create(bob, 'USD', 30000);
    await pay(bob, bobDeal, 5000);
    for (const other of [bob, business, unconfirmed, admin]) {
      for (const [table, id] of [['creator_campaigns', deal], ['campaign_deliverables', first], ['campaign_payments', deposit]]) {
        assert.deepEqual((await as(other, `select * from public.${table} where id=$1`, [id])).rows, []);
      }
      assert.equal((await summary(other)).some(row => row.id === deal), false);
      assert.equal((await as(other, 'select public.owns_creator_campaign($1) as owns', [deal])).rows[0].owns, false);
    }
    assert.deepEqual((await summary(bob)).map(row => row.id), [bobDeal]);
    assert.deepEqual((await summary(alice)).map(row => row.id), [deal]);
    assert.equal((await as(bob, 'select * from public.campaign_payments')).rows.length, 1, 'unfiltered reads still expose only the owner’s rows');
    for (const sql of ['select * from public.creator_campaigns', 'select * from public.campaign_payments', 'select * from public.campaign_deliverables', 'select * from public.creator_campaign_summary()']) {
      await assert.rejects(() => as(null, sql), /permission denied/);
    }
  });

  await t.test('tampered RPC calls and direct writes cannot cross owners or bypass validation', async () => {
    for (const other of [bob, admin]) {
      await assert.rejects(() => add(other, deal, 'Injected work', '2026-01-10'), /Campaign not found/);
      await assert.rejects(() => publish(other, first), /Deliverable not found/);
      await assert.rejects(() => pay(other, deal, 1), /Campaign not found/);
    }
    for (const role of [alice, bob, business, unconfirmed]) {
      for (const sql of [
        `insert into public.creator_campaigns(creator_id,brand_name,title,currency,total_minor) values('${role}','Brand','Forged','ZAR',1)`,
        `update public.creator_campaigns set creator_id='${bob}' where id='${deal}'`,
        `delete from public.creator_campaigns where id='${deal}'`,
        `insert into public.campaign_payments(campaign_id,amount_minor,received_on,request_id) values('${deal}',1,'2026-01-01','${randomUUID()}')`,
        `update public.campaign_payments set amount_minor=1 where id='${deposit}'`,
        `update public.campaign_payments set campaign_id='${randomUUID()}' where id='${deposit}'`,
        `delete from public.campaign_payments where id='${deposit}'`,
        `insert into public.campaign_deliverables(campaign_id,title,due_on) values('${deal}','Forged','2026-01-01')`,
        `update public.campaign_deliverables set published_at=now() where id='${first}'`,
        `delete from public.campaign_deliverables where id='${first}'`,
      ]) await assert.rejects(() => as(role, sql), /permission denied/);
    }
    for (const other of [null, business, unconfirmed]) {
      const denied = /permission denied|creators only|Confirm your email|confirmed email/i;
      await assert.rejects(() => create(other), denied);
      await assert.rejects(() => add(other, deal, 'No access', '2026-01-10'), denied);
      await assert.rejects(() => publish(other, first), denied);
      await assert.rejects(() => pay(other, deal, 1), denied);
    }
    // Revoking confirmation also removes an existing owner's reads and writes.
    await root('update auth.users set email_confirmed_at=null where id=$1', [alice]);
    assert.deepEqual(await summary(alice), []);
    assert.deepEqual((await as(alice, 'select * from public.campaign_payments')).rows, []);
    await assert.rejects(() => pay(alice, deal, 1), /Confirm your email|confirmed email/i);
    await root('update auth.users set email_confirmed_at=now() where id=$1', [alice]);
  });

  await t.test('publication changes what is due next and supports safe retries and undo', async () => {
    await publish(alice, first);
    const timestamp = (await as(alice, 'select published_at from public.campaign_deliverables where id=$1', [first])).rows[0].published_at;
    await publish(alice, first);
    assert.deepEqual((await as(alice, 'select published_at from public.campaign_deliverables where id=$1', [first])).rows[0].published_at, timestamp);
    assert.equal((await summary(alice))[0].next_due_on.toISOString().slice(0, 10), '2026-01-12');
    await publish(alice, first, false);
    assert.equal((await summary(alice))[0].next_due_on.toISOString().slice(0, 10), '2026-01-10');
    await publish(alice, first);
    await publish(alice, second);
    assert.equal((await summary(alice))[0].next_due_on, null);
    assert.equal(Number((await summary(alice))[0].open_deliverables), 0);
  });

  await t.test('invalid and excess payments are rejected; retrying a payment cannot charge it twice', async () => {
    await assert.rejects(() => pay(alice, deal, 200001), /exceeds the outstanding/);
    for (const amount of [0, -1, null]) await assert.rejects(() => pay(alice, deal, amount), /constraint/);
    await assert.rejects(() => pay(alice, deal, 1, randomUUID(), '2100-12-31'), /future/);
    await assert.rejects(() => pay(alice, deal, 1, randomUUID(), '1999-12-31'), /constraint/);
    await assert.rejects(() => pay(alice, deal, 1, null), /constraint/);
    const key = randomUUID(), final = await pay(alice, deal, 200000, key);
    assert.equal(await pay(alice, deal, 200000, key), final, 'same form retry returns the existing record even after fully paid');
    await assert.rejects(() => pay(alice, deal, 199999, key), /already used/);
    await assert.rejects(() => pay(alice, deal, 1), /exceeds the outstanding/);
    const [row] = await summary(alice);
    assert.equal(Number(row.paid_minor), 300000);
    assert.equal(Number(row.outstanding_minor), 0);
    assert.equal((await as(alice, 'select * from public.campaign_payments where campaign_id=$1', [deal])).rows.length, 2);
  });

  await t.test('money remains exact and in its original currency; constraints guard direct RPC inputs', async () => {
    const usd = await create(alice, 'USD', 30);
    await pay(alice, usd, 10);
    await pay(alice, usd, 20);
    const row = (await summary(alice)).find(row => row.id === usd);
    assert.equal(row.currency, 'USD');
    assert.equal(Number(row.paid_minor), 30);
    assert.equal(Number(row.outstanding_minor), 0);
    await assert.rejects(() => create(alice, 'FAKE'), /constraint/);
    for (const amount of [0, -1, 1000000000001]) await assert.rejects(() => create(alice, 'ZAR', amount), /constraint/);
    await assert.rejects(() => as(alice, "select public.create_creator_campaign(' ','Title','ZAR',100)"), /constraint/);
    await assert.rejects(() => add(alice, deal, ' ', '2026-01-10'), /constraint/);
    await assert.rejects(() => add(alice, deal, 'Bad date', '2026-02-30'), /date\/time field value out of range/);
    await assert.rejects(() => publish(alice, first, null), /Choose a publication status/);
  });
});
