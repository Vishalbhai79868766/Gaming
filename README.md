# NEXZZA - Real-Time Gaming Community Platform

Engineered with Next.js 14 App Router, TypeScript (strict), Tailwind CSS, Supabase PostgreSQL, Realtime WebSockets, Storage, and Row Level Security (RLS).

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and insert your Supabase project credentials:
```bash
cp .env.example .env.local
```

### 3. Apply Database Migrations & Policies
Open your Supabase SQL Editor and run:
1. `supabase/migrations/20260101000000_initial_schema.sql`
2. `supabase/migrations/20260101000001_storage_policies.sql`
3. Optional development seed: `supabase/seed.sql`

### 4. Create the First Administrator
Once you register an account, grant yourself administrative privileges safely via SQL:
```sql
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM public.profiles WHERE username_lower = 'your_username');
```

### 5. Run Local Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)