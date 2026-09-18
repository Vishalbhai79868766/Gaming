import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatBox } from '@/components/chat/chat-box';

export default async function GlobalChatPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="h-full flex flex-col bg-navy-900">
      <header className="h-16 border-b border-navy-700 flex items-center justify-between px-6 bg-navy-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Official Global Chat
          </h1>
          <p className="text-xs text-muted-grey">Public community channel for verified players</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden p-4">
        <ChatBox currentUserId={user.id} />
      </div>
    </div>
  );
}