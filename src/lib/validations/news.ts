import { z } from 'zod';

export const CreateNewsSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters').max(120),
  articleBody: z.string().min(50, 'Article must be at least 50 characters'),
  coverImageUrl: z.string().url('Invalid cover image URL'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  gameName: z.string().min(1, 'Game name is required'),
  platform: z.enum(['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile', 'Multiplatform']),
  category: z.enum(['Game Updates', 'Leaks and Rumours', 'Esports', 'Community News', 'Opinion']),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
  sourceType: z.enum(['external_news', 'original_reporting', 'opinion', 'community_announcement', 'leak_rumour']),
  sourceUrl: z.string().url().optional().or(z.literal('')),
});