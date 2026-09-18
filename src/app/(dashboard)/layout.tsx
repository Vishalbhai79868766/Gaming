import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Mail, Newspaper, Bell, Shield, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
  const isAdmin = roleData?.role === 'admin' || roleData?.role === 'moderator';

  return (
    <div className="flex h-screen bg-navy-900 text-white overflow-hidden">
      <aside className="w-64 bg-navy-800 border-r border-navy-700 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-navy-700">
            <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-navy-900 font-black shadow-glow-blue">
              N
            </div>
            <span className="font-black text-lg tracking-wider">NEXZZA</span>
          </div>

          <nav className="p-4 space-y-1 text-sm font-medium">
            <Link href="/global-chat" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-700 text-slate-200 hover:text-white transition">
              <MessageSquare className="w-4 h-4 text-electric-blue" /> Global Chat
            </Link>
            <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-700 text-slate-200 hover:text-white transition">
              <Mail className="w-4 h-4 text-electric-blue" /> Squad Chats
            </Link>
            <Link href="/news" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-700 text-slate-200 hover:text-white transition">
              <Newspaper className="w-4 h-4 text-electric-blue" /> Today's News
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-700 text-slate-200 hover:text-white transition">
              <Bell className="w-4 h-4 text-electric-blue" /> Notifications
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-700 text-amber-400 hover:text-amber-300 transition">
                <Shield className="w-4 h-4 text-amber-400" /> Admin & Mod
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-navy-700 border border-electric-blue/40 flex items-center justify-center font-bold text-electric-blue">
                {profile?.display_name?.charAt(0) || 'P'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{profile?.display_name || 'Player'}</p>
                <p className="text-[10px] text-muted-grey truncate">@{profile?.username || 'user'}</p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="p-2 text-muted-grey hover:text-red-400 transition" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}