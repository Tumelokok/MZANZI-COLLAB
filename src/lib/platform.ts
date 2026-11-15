export const platforms = ["instagram", "tiktok", "youtube", "facebook", "x", "snapchat"] as const;
export const platformNames: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook", x: "X / Twitter", snapchat: "Snapchat" };
export type ActionState = { message: string; ok?: boolean };
export type Profile = { id: string; display_name: string; bio: string; city: string; category: string; photo_path: string; portfolio_url: string; published: boolean; verified_until: string | null; promoted_until: string | null };
export type SocialAccount = { id: string; creator_id: string; platform: string; handle: string; profile_url: string; rate_zar: number; followers: number | null; synced_at: string | null; ownership_checked: boolean };
export type Creator = Profile & { score: number | null; rating_count: number; total_followers: number | null; synced_accounts: number; social_count: number; last_synced: string | null };
export function profileTasks(profile: Profile, socials: SocialAccount[]) {
  return [
    { label: "Write a bio of at least 50 characters", done: profile.bio.trim().length >= 50 },
    { label: "Upload a profile picture", done: Boolean(profile.photo_path) },
    { label: "Add your category and city", done: Boolean(profile.category && profile.city) },
    { label: "Link a portfolio or content sample", done: Boolean(profile.portfolio_url) },
    { label: "Add social profiles and a ZAR rate for each", done: socials.length > 0 && socials.every(s => Number(s.rate_zar) > 0) },
    { label: "Make your creator profile public", done: profile.published },
  ];
}
export function avatarUrl(path: string) {
  return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : null;
}
export function active(until: string | null) { return Boolean(until && new Date(until).getTime() > Date.now()); }
export function rankCreators(creators: Creator[]) {
  return creators.filter(c => c.rating_count >= 3 && c.score != null).sort((a,b) => Number(b.score) - Number(a.score) || b.rating_count-a.rating_count || a.id.localeCompare(b.id));
}
export function safeNext(value: string | null) { return value === "/reset-password" ? value : "/dashboard"; }
export function number(value: number | null) { return value == null ? "Not synced" : Number(value).toLocaleString("en-ZA"); }
