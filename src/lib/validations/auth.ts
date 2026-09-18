import { z } from 'zod';

export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'moderator', 'support', 'nexzza', 'system', 'help', 'root'
];

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(32),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Letters, numbers, underscores, and periods only')
    .transform((val) => val.toLowerCase())
    .refine((val) => !RESERVED_USERNAMES.includes(val), 'Username is reserved'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Community Guidelines' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});