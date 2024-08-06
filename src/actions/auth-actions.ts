'use server';

import { getUserByEmail } from '@/lib/server-utils';
import { signupSchema } from '@/lib/zod';

export async function signupAction(data: unknown) {
  const validation = signupSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, errors, message: '' };
  }

  const { name, email, password, passwordConfirm } = validation.data;

  let user;

  try {
    const userExists = await getUserByEmail(email);

    if (userExists && userExists.emailVerified) {
      const message = 'Konto o podanym adresie email już istnieje';
      return { success: false, errors: {}, message };
    }
  } catch (error) {}
}
