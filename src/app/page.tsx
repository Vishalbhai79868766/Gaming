import Link from 'next/link';
import { Gamepad2, Shield, MessageSquare, Newspaper, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col justify-between">
      <header className="border-b border-navy-700 bg-navy-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-electric-blue flex items-center justify-center text-navy-900 font-black shadow-glow-blue">
              N
            </div>
            <span className="text-xl font-bold tracking-wider">NEXZZA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-grey hover:text-white transition">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-electric-blue hover:bg-light-blue text-navy-900 font-bold px-4 py-2 rounded-md text-sm transition shadow-glow-blue"
            >
              Join NEXZZA
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue text-xs font-semibold mb-8">
          <Zap className="w-3.5 h-3.5" /> Next-Generation Gaming Network
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight">
          Where Gamers Connect, Squad Up, and Publish News.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-grey max-w-2xl">
          Real-time global chats, tactical squad channels, voice note messaging, and player-curated gaming news.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="bg-electric-blue hover:bg-light-blue text-navy-900 font-bold px-8 py-3.5 rounded-xl text-base transition shadow-glow-blue"
          >
            Create Gamer Account
          </Link>
          <Link
            href="/login"
            className="bg-navy-800 hover:bg-navy-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base border border-navy-700 transition"
          >
            Explore Platform
          </Link>
        </div>
      </main>
    </div>
  );
}