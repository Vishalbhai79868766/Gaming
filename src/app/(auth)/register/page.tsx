'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service & Guidelines');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-md bg-navy-800 border border-navy-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white">NEXZZA</h1>
          <p className="text-muted-grey text-sm mt-1">Create your player identity</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-sm text-muted-grey mb-4">
              We sent an activation link to <span className="text-white">{email}</span>. Click the link to verify your gamer profile.
            </p>
            <Link href="/login" className="text-electric-blue text-sm hover:underline font-semibold">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
                placeholder="Ghost Rider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Unique @Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
                placeholder="ghost_rider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Email</label>
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
              <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-grey uppercase mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-navy-700 text-electric-blue focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-muted-grey">
                I accept the Terms of Service & Community Guidelines
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-blue hover:bg-light-blue text-navy-900 font-bold py-2.5 rounded-lg text-sm transition shadow-glow-blue disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}