import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader,SiteFooter } from "@/components/site-header";
import { CreatorCard,EmptyState } from "@/components/platform-ui";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { active,rankCreators,type Creator } from "@/lib/platform";
export const metadata={title:"Creator Top 20 | Mzansi Collab",description:"Discover South African creators by community ratings, with transparent featured placements and checked profiles."};
async function Chart({searchParams}:{searchParams:Promise<{size?:string;verified?:string}>}) {
  const params=await searchParams,size=params.size==="100"?100:20,verified=params.verified==="1";
  let creators:Creator[]=[];
  if(isSupabaseConfigured()){const db=await createClient();const {data,error}=await db.rpc("creator_directory");if(error)throw new Error("The creator chart could not load.");creators=(data||[]) as Creator[];}
  if(verified)creators=creators.filter(c=>active(c.verified_until));
  const ranked=rankCreators(creators).slice(0,size),featured=creators.filter(c=>active(c.promoted_until)).sort((a,b)=>a.id.localeCompare(b.id)),emerging=creators.filter(c=>c.rating_count<3).slice(0,20);
  return <><SiteHeader/><main className="chart-page detail-shell"><header className="chart-heading"><p className="eyebrow eyebrow-dark">The community decides</p><h1>Creator <em>Top {size}.</em></h1><p>Great content. A distinct point of view. A community that values your work. Ranked by 1–5 star ratings from creators and businesses—not follower counts.</p><nav className="chart-filters" aria-label="Chart filters"><Link aria-current={size===20&&!verified?"page":undefined} href="/chart">Top 20</Link><Link aria-current={size===100&&!verified?"page":undefined} href="/chart?size=100">Top 100</Link><Link aria-current={verified?"page":undefined} href="/chart?verified=1">Verified creators</Link></nav></header>
    <details className="chart-rules"><summary>How ranking and badges work</summary><p>The score is the average of eligible 1–5 star ratings. Three distinct reviewers are needed to enter the chart. Higher scores rank first; ties use rating count, then a stable account identifier. Followers and tokens never change the score. Members must confirm their email, add a bio and wait 24 hours before rating. Self-ratings are blocked; each member has one editable rating per creator. Moderators can exclude abusive ratings.</p><p>Featured placements cost earned tokens and are labelled separately. A “Profile verified” badge means profile completeness and linked-account ownership were reviewed; it does not certify popularity, content quality or conduct.</p></details>
    {featured.length>0&&<section className="featured-directory"><p className="eyebrow eyebrow-dark">Featured · token-promoted placements</p><div className="directory-grid">{featured.map(c=><CreatorCard key={c.id} creator={c} featured/>)}</div></section>}
    <section className="organic-directory"><h2>{verified?"Verified creator chart":"Community chart"}</h2>{ranked.length?<div className="directory-grid">{ranked.map((c,i)=><CreatorCard key={c.id} creator={c} rank={i+1}/>)}</div>:<EmptyState title="The next names on this chart are still being discovered.">Creators appear once their profiles are complete and they have three community ratings. <Link href="/signup">Create your profile →</Link></EmptyState>}</section>
    {emerging.length>0&&<section className="organic-directory"><h2>Meet the emerging voices</h2><p>Complete profiles building towards their first three ratings. No rank yet.</p><div className="directory-grid">{emerging.map(c=><CreatorCard key={c.id} creator={c}/>)}</div></section>}
  </main><SiteFooter/></>;
}
export default function Page(props:{searchParams:Promise<{size?:string;verified?:string}>}){return <Suspense fallback={<p className="loading">Loading the creator chart…</p>}><Chart {...props}/></Suspense>;}
