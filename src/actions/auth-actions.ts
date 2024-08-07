'use server';

import { sendVerificationEmail } from '@/lib/resend';
import {
  createVerificationToken,
  generateCode,
  getUserByEmail,
  upsertUser,
} from '@/lib/server-utils';
import { signupSchema } from '@/lib/zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signupAction(data: unknown) {
  const validation = signupSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, errors, message: '' };
  }

  const { name, email, password } = validation.data;

  let user;

  try {
    const userExists = await getUserByEmail(email);

    if (userExists && userExists.emailVerified) {
      const message = 'Konto o podanym adresie email już istnieje';
      return { success: false, errors: {}, message };
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await upsertUser(name, email, passwordHash, undefined);
      const code = generateCode();
      const verificationToken = await createVerificationToken(code, user.id);
      await sendVerificationEmail(verificationToken.code);
    }
  } catch (error) {
    const message = 'Coś poszło nie tak. Spróbuj ponownie';
    return { success: false, errors: {}, message };
  }

  redirect(`/signup/verify-email?userid=${user.id}`);
}
