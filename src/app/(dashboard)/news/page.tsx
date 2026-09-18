import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function NewsPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from('news_posts')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Today's Gaming News</h1>
          <p className="text-xs text-muted-grey">Player-curated updates, announcements, leaks, and patch analyses.</p>
        </div>
        <Link href="/news/create" className="bg-electric-blue hover:bg-light-blue text-navy-900 font-bold px-4 py-2 rounded-lg text-xs transition">
          + Publish News
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts?.map(p => (
          <div key={p.id} className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
            <img src={p.cover_image_url} alt={p.headline} className="w-full h-44 object-cover" />
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-electric-blue uppercase">{p.category}</span>
              <h3 className="font-bold text-sm text-white line-clamp-2">{p.headline}</h3>
              <p className="text-xs text-muted-grey line-clamp-3">{p.article_body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}