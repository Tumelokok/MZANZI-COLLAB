import { notFound } from 'next/navigation';
import { requireAccount } from './account';

export async function requireCreatorAccount() {
  const context = await requireAccount();
  if (context.account.role !== 'creator') notFound();
  return context;
}

export function campaignSetupMissing(error: { code?: string } | null) {
  return !!error && ['42P01', 'PGRST202', 'PGRST205'].includes(error.code ?? '');
}
