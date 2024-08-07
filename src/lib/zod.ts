import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().trim().min(1).max(32),
    email: z.string().email().trim().min(1).max(255),
    password: z.string().min(8).max(64),
    passwordConfirm: z.string().min(8).max(64),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export const verifyEmailSchema = z.object({
  code: z.string().length(6),
});
