import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('database enforces roles, token accounting, referrals, ratings and review gates', async (t) => {
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
  await db.exec(`insert into auth.users values ('10000000-0000-4000-8000-000000000001',now(),'{"role":"creator","display_name":"Existing creator"}'),('10000000-0000-4000-8000-000000000002',now(),'{"role":"business","display_name":"Existing business"}')`);
  await db.exec(await readFile(new URL('../supabase/migrations/202611150001_platform.sql', import.meta.url),'utf8'));
  const backfill=await readFile(new URL('../supabase/migrations/202611150002_existing_members.sql',import.meta.url),'utf8');
  await db.exec(backfill);
  await db.exec(backfill);
  assert.equal((await db.query("select count(*)::int as n from public.wallets")).rows[0].n,1,'backfill creates only creator wallets and is repeatable');
  assert.equal((await db.query("select display_name from public.profiles where id='10000000-0000-4000-8000-000000000001'")).rows[0].display_name,'Existing creator');
  const ids = Array.from({length:8},(_,i)=>`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`);
  async function root(sql,params=[]){await db.exec('reset role');return db.query(sql,params);}
  async function as(id,sql,params=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec(`set role ${id?'authenticated':'anon'}`);return db.query(sql,params);}
  async function fails(id,sql,params=[],pattern){await assert.rejects(()=>as(id,sql,params),pattern);}
  for(let i=0;i<ids.length;i++) await root(`insert into auth.users values($1,now(),$2)`,[ids[i],JSON.stringify({role:i===2?'business':'creator',display_name:`Member ${i+1}`})]);
  await root("update public.accounts set created_at=now()-interval '8 days'");
  await root('update public.accounts set created_at=now() where id=$1',[ids[3]]);
  const inviter=(await root('select referral_code from public.accounts where id=$1',[ids[0]])).rows[0].referral_code;
  await root('update public.accounts set referred_by=$1 where id in ($2,$3)',[ids[0],ids[1],ids[3]]);
  assert.equal(inviter.length,12);
  async function complete(id) {
    await root('insert into storage.objects(bucket_id,name,owner_id) values($1,$2,$3)',['avatars',`${id}/photo.png`,id]);
    await as(id,`select public.save_profile($1,$2,'Lifestyle','Johannesburg','https://example.com/work',true,$3)`,['Creator', 'A complete authentic creator biography with more than fifty characters of useful information.',`${id}/photo.png`]);
    await as(id,"select public.save_social('instagram','creator','https://www.instagram.com/creator/',500)");
  }
  await fails(null,'select public.claim_profile_reward()',[],/permission denied/);
  await fails(ids[2],'select public.claim_profile_reward()',[],/creators only/);
  await fails(ids[0],'select public.claim_profile_reward()',[],/Complete and publish/);
  await fails(ids[0],"update public.accounts set role='business'",[],/permission denied/);
  await fails(ids[0],"select public.apply_tokens($1,1000,'cheat','cheat')",[ids[0]],/permission denied/);
  await complete(ids[0]);await complete(ids[1]);await complete(ids[3]);
  await as(ids[0],'select public.claim_profile_reward()');await as(ids[0],'select public.claim_profile_reward()');
  assert.equal((await as(ids[0],'select balance from public.wallets')).rows[0].balance,40);
  await fails(ids[0],'select public.buy_promotion()',[],/Not enough tokens/);
  assert.equal((await as(ids[1],'select * from public.wallets where creator_id=$1',[ids[0]])).rows.length,0);
  await as(ids[1],'select public.claim_profile_reward()');await as(ids[1],'select public.claim_profile_reward()');
  await as(ids[0],'select public.claim_referrals()');await as(ids[3],'select public.claim_profile_reward()');
  assert.equal((await as(ids[0],'select balance from public.wallets')).rows[0].balance,70,'qualified referral pays once; new account pays nothing');
  await as(ids[0],'select public.buy_promotion()');
  assert.equal((await as(ids[0],'select balance from public.wallets')).rows[0].balance,10);
  await fails(ids[0],'select public.buy_promotion()',[],/already active/);
  await fails(ids[0],'select public.request_verification($1)',['My profile proof is available at my public social profile.'],/Earn 100 tokens/);
  await root("select public.apply_tokens($1,100,'test fixture','fixture')",[ids[0]]);
  await as(ids[0],'select public.request_verification($1)',['Public proof and account ownership details for the reviewer.']);
  await fails(ids[1],"select public.review_verification($1,true,'All linked accounts checked')",[ids[0]],/Reviewer access/);
  await root('insert into public.platform_admins values($1)',[ids[7]]);
  await as(ids[7],"select public.review_verification($1,true,'Confirmed all account ownership evidence')",[ids[0]]);
  assert.equal((await as(ids[0],'select balance from public.wallets')).rows[0].balance,10);
  await fails(ids[7],"select public.review_verification($1,true,'Checked everything again')",[ids[0]],/No pending request/);
  await fails(ids[0],"select public.rate_creator($1,5,'Rating my own content is prohibited')",[ids[0]],/check constraint/);
  await fails(ids[3],"select public.rate_creator($1,5,'I enjoy the creator perspective')",[ids[0]],/24 hours/);
  await fails(ids[1],"select public.rate_creator($1,6,'Out of range rating should fail')",[ids[0]],/check constraint/);
  await as(ids[1],"select public.rate_creator($1,4,'Thoughtful original content and a useful creative voice.')",[ids[0]]);
  await as(ids[1],"select public.rate_creator($1,5,'Updated opinion: thoughtful work and a distinctive perspective.')",[ids[0]]);
  const chart=(await as(null,'select * from public.creator_directory()')).rows.find(r=>r.id===ids[0]);
  assert.equal(Number(chart.score),5);assert.equal(Number(chart.rating_count),1);assert.equal(chart.total_followers,null);
  await root('update public.social_accounts set followers=9999999 where creator_id=$1',[ids[0]]);
  assert.equal(Number((await as(null,'select * from public.creator_directory()')).rows.find(r=>r.id===ids[0]).score),5,'followers do not affect score');
  await as(ids[0],"select public.save_social('instagram','updated','https://www.instagram.com/updated/',800)");
  const updated=(await as(ids[0],'select * from public.profiles where id=$1',[ids[0]])).rows[0];
  assert.equal(updated.verified_until,null,'profile changes invalidate badge');
  assert.equal((await as(ids[0],'select followers from public.social_accounts')).rows.find(r=>r.followers!==null),undefined,'changing links clears counts');
  const amount=(await root('select sum(amount)::int as amount from public.token_ledger where creator_id=$1',[ids[0]])).rows[0].amount;
  assert.equal(amount,(await as(ids[0],'select balance from public.wallets')).rows[0].balance);
});
