import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">Private & Squad Messages</h1>
      <p className="text-xs text-muted-grey">Encrypted direct conversations and invite-only tactical squads.</p>
    </div>
  );
}