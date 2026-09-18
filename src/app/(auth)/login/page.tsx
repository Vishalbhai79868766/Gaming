'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setError(signInErr.message);
      setLoading(false);
      return;
    }

    router.push('/global-chat');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-md bg-navy-800 border border-navy-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white">NEXZZA</h1>
          <p className="text-muted-grey text-sm mt-1">Sign in to your player account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
              placeholder="player@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-grey uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs text-electric-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-blue hover:bg-light-blue text-navy-900 font-bold py-2.5 rounded-lg text-sm transition shadow-glow-blue disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-grey">
          Don't have an account?{' '}
          <Link href="/register" className="text-electric-blue hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}