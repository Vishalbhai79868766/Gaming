'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';

export function AiCompanionBot({ onInsertTip }: { onInsertTip?: (tip: string) => void }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askCompanion = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);

    try {
      const apiKey = "";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          systemInstruction: {
            parts: [{ text: "You are the official NEXZZA in-game tactician bot. Answer gamer questions briefly with high energy." }]
          }
        })
      });

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply available.";
      setResponse(text);
      if (onInsertTip) onInsertTip(text);
    } catch {
      setResponse("Tactical bot offline. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-navy-900 border border-purple-500/30 space-y-3">
      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span>NEXZZA AI Squad Tactician</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for map callouts, weapon meta, or clutch tips..."
          className="flex-1 bg-navy-950 border border-navy-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
        />
        <button 
          onClick={askCompanion} 
          disabled={loading || !query.trim()}
          className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
        >
          {loading ? '...' : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>

      {response && (
        <div className="p-3 bg-navy-950/80 border border-purple-500/20 rounded-lg text-xs text-slate-200 whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}