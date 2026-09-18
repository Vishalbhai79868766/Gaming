'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VoiceRecorder } from './voice-recorder';
import { Send, Mic } from 'lucide-react';
import { filterProfanity } from '@/lib/utils/profanity-filter';

export function ChatBox({ currentUserId }: { currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(username, display_name, avatar_url)')
        .is('conversation_id', null)
        .order('created_at', { ascending: true })
        .limit(60);

      if (data) setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    loadMessages();

    const channel = supabase
      .channel('global_chat_stream')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=is.null' }, async (payload) => {
        const { data: userProfile } = await supabase.from('profiles').select('username, display_name, avatar_url').eq('id', payload.new.sender_id).single();
        setMessages((prev) => [...prev, { ...payload.new, profiles: userProfile }]);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setSending(true);

    const sanitized = filterProfanity(inputText.trim());
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      content: sanitized,
      conversation_id: null,
    });

    setInputText('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-navy-800 border border-navy-700 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-700 border border-electric-blue/40 flex items-center justify-center font-bold text-electric-blue text-xs">
              {msg.profiles?.display_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{msg.profiles?.display_name}</span>
                <span className="text-[10px] text-muted-grey">@{msg.profiles?.username}</span>
              </div>
              <div className="mt-1 text-xs text-slate-200 bg-navy-900 border border-navy-700 p-2.5 rounded-lg max-w-xl">
                {msg.is_deleted ? <i className="text-muted-grey">Message was removed</i> : msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-navy-900 border-t border-navy-700">
        {showVoice ? (
          <VoiceRecorder onUploadComplete={(url) => { setInputText(`[Voice Message](${url})`); setShowVoice(false); }} onCancel={() => setShowVoice(false)} />
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <button type="button" onClick={() => setShowVoice(true)} className="p-2 text-muted-grey hover:text-electric-blue transition">
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message to global lobby..."
              className="flex-1 bg-navy-800 border border-navy-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-electric-blue"
            />
            <button type="submit" disabled={sending || !inputText.trim()} className="bg-electric-blue text-navy-900 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}