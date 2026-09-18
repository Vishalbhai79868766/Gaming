import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CreateNewsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-white">Publish Gaming Article</h1>
      <p className="text-xs text-muted-grey">Submit your news post. It publishes immediately as Community News.</p>
    </div>
  );
}