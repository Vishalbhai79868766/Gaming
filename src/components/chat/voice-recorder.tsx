'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export function VoiceRecorder({ onUploadComplete, onCancel }: { onUploadComplete: (url: string) => void; onCancel: () => void }) {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => setBlob(new Blob(chunks, { type: 'audio/webm' }));
      recorder.start();
      setRecording(true);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch {
      // Handled via state fallback
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const upload = async () => {
    if (!blob) return;
    const path = `voice/${Date.now()}.webm`;
    const { data } = await supabase.storage.from('chat_public').upload(path, blob, { contentType: 'audio/webm' });
    if (data) {
      const { data: pub } = supabase.storage.from('chat_public').getPublicUrl(data.path);
      onUploadComplete(pub.publicUrl);
    }
  };

  return (
    <div className="flex items-center justify-between bg-navy-900 p-2 rounded-lg border border-navy-700">
      <div className="flex items-center gap-2">
        {!recording && !blob && (
          <button onClick={start} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-bold">
            Record Audio
          </button>
        )}
        {recording && (
          <button onClick={stop} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-bold">
            Stop ({timer}s)
          </button>
        )}
        {blob && <audio controls src={URL.createObjectURL(blob)} className="h-8 max-w-xs" />}
      </div>
      <div className="flex gap-2">
        {blob && (
          <button onClick={upload} className="px-3 py-1 bg-electric-blue text-navy-900 font-bold text-xs rounded-lg">
            Send Voice Note
          </button>
        )}
        <button onClick={onCancel} className="px-3 py-1 bg-navy-700 text-muted-grey text-xs rounded-lg hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}