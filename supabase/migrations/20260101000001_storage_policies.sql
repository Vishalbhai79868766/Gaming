-- Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news_media', 'news_media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_public', 'chat_public', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_private', 'chat_private', false) ON CONFLICT DO NOTHING;

-- Public Avatar Policies
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar User Upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private Chat Storage Policy (Requires active group/direct membership)
CREATE POLICY "Private Chat Attachment Read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat_private' AND EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);