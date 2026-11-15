"use server";
import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { requireAccount } from "@/lib/account";
import type { ActionState } from "@/lib/platform";

function text(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function result(error: { message: string; code?: string } | null, success: string): ActionState {
  if (error) return { message: error.code === "P0001" ? error.message : "That change could not be saved. Check the fields and try again." };
  revalidatePath("/dashboard"); revalidatePath("/chart"); revalidatePath("/members", "layout");
  return { ok: true, message: success };
}
export async function saveProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAccount();
  const url = text(form,"portfolio_url");
  if (url && (!URL.canParse(url) || new URL(url).protocol !== "https:" || url.length > 500)) return { message: "Use a valid https portfolio or website URL." };
  const { error } = await supabase.rpc("save_profile", { p_name: text(form,"display_name"),p_bio: text(form,"bio"),p_category: text(form,"category"),p_city: text(form,"city"),p_portfolio: url,p_published: form.get("published")==="on" });
  return result(error,"Profile saved. Changes to profile details require a fresh badge review.");
}
export async function uploadPhoto(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase,user } = await requireAccount();
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0 || file.size > 3*1024*1024) return { message: "Choose a JPG, PNG or WebP image smaller than 3 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71;
  const jpg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  const webp = new TextDecoder().decode(bytes.slice(0,4))==="RIFF" && new TextDecoder().decode(bytes.slice(8,12))==="WEBP";
  if (!png && !jpg && !webp) return { message: "That file is not a supported image." };
  const ext = png ? "png" : jpg ? "jpg" : "webp";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, bytes, { contentType: jpg ? "image/jpeg" : `image/${ext}`, upsert: false });
  if (uploadError) return { message: "The photo could not be uploaded. Please try again." };
  const { data: p } = await supabase.from("profiles").select("*").eq("id",user.id).single();
  if (!p) { await supabase.storage.from("avatars").remove([path]); return { message: "Profile not found." }; }
  const { error } = await supabase.rpc("save_profile", { p_name:p.display_name,p_bio:p.bio,p_category:p.category,p_city:p.city,p_portfolio:p.portfolio_url,p_published:p.published,p_photo:path });
  if (error) await supabase.storage.from("avatars").remove([path]);
  return result(error,"Photo uploaded. Uploaded profile photos are publicly accessible.");
}
export async function saveSocial(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAccount();
  const rate = Number(form.get("rate_zar"));
  if (!Number.isFinite(rate) || rate<=0) return { message: "Add a positive rate in South African rand." };
  const { error } = await supabase.rpc("save_social", { p_platform:text(form,"platform"),p_handle:text(form,"handle"),p_url:text(form,"profile_url"),p_rate:rate });
  return result(error,"Social profile saved. Linking a URL does not verify ownership or import followers.");
}
export async function removeSocial(_: ActionState, form: FormData): Promise<ActionState> { const { supabase }=await requireAccount(); const {error}=await supabase.rpc("remove_social",{p_id:text(form,"id")}); return result(error,"Social link removed."); }
export async function claimProfile(_: ActionState, form: FormData): Promise<ActionState> { void form; const {supabase}=await requireAccount(); const {error}=await supabase.rpc("claim_profile_reward");return result(error,"Profile checked. The one-time 40-token reward is recorded in your wallet."); }
export async function claimReferrals(_: ActionState, form: FormData): Promise<ActionState> { void form;const {supabase}=await requireAccount();const {data,error}=await supabase.rpc("claim_referrals");return result(error,`${data || 0} new qualified referrals rewarded. Each referral can earn tokens once.`); }
export async function buyPromotion(_: ActionState, form: FormData): Promise<ActionState> { void form;const {supabase}=await requireAccount();const {error}=await supabase.rpc("buy_promotion");return result(error,"Featured placement is active for 7 days. Your star rating is unchanged."); }
export async function requestVerification(_: ActionState, form: FormData): Promise<ActionState> {const {supabase}=await requireAccount();const {error}=await supabase.rpc("request_verification",{p_evidence:text(form,"evidence")});return result(error,"Review requested. 100 tokens are charged only if the reviewer approves your profile."); }
export async function rateCreator(_: ActionState, form: FormData): Promise<ActionState> {const {supabase}=await requireAccount();const {error}=await supabase.rpc("rate_creator",{p_creator:text(form,"creator_id"),p_stars:Number(form.get("stars")),p_review:text(form,"review")});return result(error,"Your rating has been saved. One rating per member, per creator."); }
export async function reviewVerification(_: ActionState, form: FormData): Promise<ActionState> {
  const {supabase}=await requireAccount(); const approve=text(form,"decision")==="approve";
  if (approve && form.get("ownership_checked")!=="on") return { message:"Confirm you independently checked the creator’s identity and each linked account." };
  const {error}=await supabase.rpc("review_verification",{p_creator:text(form,"creator_id"),p_approve:approve,p_note:text(form,"note")}); revalidatePath("/dashboard/admin"); return result(error,"Review recorded.");
}
export async function moderateRating(_: ActionState, form: FormData): Promise<ActionState> {const {supabase}=await requireAccount();const {error}=await supabase.rpc("moderate_rating",{p_id:text(form,"rating_id"),p_hidden:text(form,"decision")==="hide",p_note:text(form,"note")});revalidatePath("/dashboard/admin");return result(error,"Rating moderation recorded.");}
export async function syncYouTube(_: ActionState, form: FormData): Promise<ActionState> {
  void form; const {supabase,user,account}=await requireAccount();
  if(account.role!=="creator")return {message:"Follower syncing is for creator accounts."};
  const key=process.env.YOUTUBE_API_KEY, secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key||!secret)return {message:"YouTube syncing needs an API connection from the platform administrator. Your link is saved, but no follower count has been imported."};
  const {data:claimed,error}=await supabase.rpc("begin_youtube_sync");
  if(error)return result(error,"");
  const social=claimed?.[0];
  if(!social)return {message:"Add your YouTube channel first, or wait 15 minutes between refresh attempts."};
  const path=new URL(social.profile_url).pathname;
  const params=new URLSearchParams({part:"statistics",key});
  if(path.startsWith("/channel/"))params.set("id",path.split("/")[2]); else params.set("forHandle",path.split("/")[1]);
  try {
    const response=await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`,{cache:"no-store",signal:AbortSignal.timeout(10000)});
    if(!response.ok)return {message:"YouTube did not return a count. Please try again later."};
    const body=await response.json(); const stats=body.items?.[0]?.statistics;
    if(!stats||stats.hiddenSubscriberCount)return {message:"This channel does not expose a subscriber count."};
    const count=Number(stats.subscriberCount);
    if(!Number.isSafeInteger(count)||count<0)return {message:"YouTube returned an unavailable count."};
    const admin=createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {error:writeError}=await admin.from("social_accounts").update({followers:count,synced_at:new Date().toISOString(),count_source:"youtube_api"}).eq("id",social.id).eq("creator_id",user.id).eq("profile_url",social.profile_url);
    return result(writeError,"YouTube count refreshed. YouTube rounds public counts; this is a snapshot, not a real-time or ownership check.");
  } catch {return {message:"The provider could not be reached. Your previous count has been kept."};}
}
