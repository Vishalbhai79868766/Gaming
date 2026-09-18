-- Custom Enumerations
CREATE TYPE user_role AS ENUM ('player', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('online', 'idle', 'dnd', 'offline');
CREATE TYPE news_source_type AS ENUM ('external_news', 'original_reporting', 'opinion', 'community_announcement', 'leak_rumour');
CREATE TYPE report_target_type AS ENUM ('user', 'global_message', 'private_message', 'news_post', 'news_comment');
CREATE TYPE report_status AS ENUM ('open', 'under_review', 'resolved', 'dismissed');
CREATE TYPE conv_type AS ENUM ('direct', 'group');
CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    username_lower TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    favourite_games TEXT[] DEFAULT '{}',
    status user_status DEFAULT 'offline',
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
    CONSTRAINT username_format CHECK (username_lower ~ '^[a-z0-9_.]+$')
);

-- 2. User Roles Table (Separated for RLS isolation)
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role DEFAULT 'player' NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. User Blocks Table
CREATE TABLE public.user_blocks (
    blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT cannot_block_self CHECK (blocker_id <> blocked_id)
);

-- 4. Conversations & Membership
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type conv_type NOT NULL,
    title TEXT,
    icon_url TEXT,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.conversation_members (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role group_role DEFAULT 'member' NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- 5. Real-Time Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Player-Created Gaming News
CREATE TABLE public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    headline TEXT NOT NULL,
    article_body TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    video_url TEXT,
    game_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    source_type news_source_type NOT NULL,
    source_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.news_likes (
    post_id UUID REFERENCES public.news_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE public.news_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.news_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.news_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.news_bookmarks (
    post_id UUID REFERENCES public.news_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- 7. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    target_url TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Reports & Moderation Actions
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    explanation TEXT,
    status report_status DEFAULT 'open' NOT NULL,
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_global ON public.messages(created_at DESC) WHERE conversation_id IS NULL;
CREATE INDEX idx_news_created_at ON public.news_posts(created_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX idx_profiles_username_lower ON public.profiles(username_lower);

-- Trigger: Automatically Initialize Profile & Player Role on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, username_lower, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    LOWER(NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'display_name'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check User Role
CREATE OR REPLACE FUNCTION public.get_user_role(u_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.user_roles WHERE user_id = u_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile fields" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Read messages in joined conversations or global chat" ON public.messages FOR SELECT TO authenticated 
USING (conversation_id IS NULL OR EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));

CREATE POLICY "Send message if not banned or suspended" ON public.messages FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = sender_id AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND (is_banned = true OR is_suspended = true)
  ) AND (
    conversation_id IS NULL OR EXISTS (
      SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Read published news" ON public.news_posts FOR SELECT TO authenticated 
USING (is_hidden = false OR public.get_user_role(auth.uid()) IN ('moderator', 'admin'));

CREATE POLICY "Active verified users can publish news" ON public.news_posts FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = author_id);