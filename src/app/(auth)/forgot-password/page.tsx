'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="w-full max-w-md bg-navy-800 border border-navy-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-2">Reset Password</h2>
        <p className="text-xs text-muted-grey mb-6">Enter your registered email address to receive a secure password recovery link.</p>

        {submitted ? (
          <div className="text-center py-4">
            <p className="text-sm text-green-400 font-semibold mb-4">Recovery email sent successfully!</p>
            <Link href="/login" className="text-xs text-electric-blue hover:underline">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-electric-blue"
              placeholder="player@example.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-blue text-navy-900 font-bold py-2.5 rounded-lg text-sm transition shadow-glow-blue disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}