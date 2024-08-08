'use server';

import { TEN_MINUTES_IN_S } from '@/lib/contstants';
import { google } from '@/lib/oauth';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/resend';
import {
  createSession,
  createVerificationToken,
  deleteSessionByID,
  generateCode,
  getUserByEmail,
  getUserByID,
  getVerificationTokenByCodeAndUserID,
  updateUserEmailVerifiedByID,
  upsertUser,
} from '@/lib/server-utils';
import { loginSchema, signupSchema, verifyEmailSchema } from '@/lib/zod';
import { generateCodeVerifier, generateState } from 'arctic';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
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

export async function verifyEmailAction(data: unknown, userID: string | null) {
  const validation = verifyEmailSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, errors, message: '' };
  }

  const { code } = validation.data;

  if (!userID) {
    const message = 'Coś poszło nie tak. Spróbuj ponownie';
    return { success: false, errors: {}, message };
  }

  try {
    const verificationToken = await getVerificationTokenByCodeAndUserID(
      code,
      userID
    );
    if (!verificationToken) {
      const message = 'Coś poszło nie tak. Spróbuj ponownie';
      return { success: false, errors: {}, message };
    }

    const isActive = verificationToken.expiresAt > new Date();
    if (!isActive) {
      const message = 'Coś poszło nie tak. Spróbuj ponownie';
      return { success: false, errors: {}, message };
    }

    const user = await getUserByID(verificationToken.userID);
    if (!user) {
      const message = 'Coś poszło nie tak. Spróbuj ponownie';
      return { success: false, errors: {}, message };
    }

    const updatedUser = await updateUserEmailVerifiedByID(user.id);
    const newSession = await createSession(updatedUser.id);
    await sendWelcomeEmail(updatedUser.name);
  } catch (error) {
    const message = 'Coś poszło nie tak. Spróbuj ponownie';
    return { success: false, errors: {}, message };
  }

  redirect('/');
}

export async function logoutAction() {
  const sessionID = cookies().get('auth_token')?.value;

  if (!sessionID) return null;

  try {
    await deleteSessionByID(sessionID);
  } catch (error) {
    return null;
  }

  cookies().delete('auth_token');
  redirect('/login');
}

export async function loginAction(data: unknown) {
  const validation = loginSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, errors, message: '' };
  }

  const { email, password } = validation.data;

  try {
    const user = await getUserByEmail(email);

    if (!user || !user.emailVerified) {
      const message = 'Nieprawidłowy email lub hasło';
      return { success: false, errors: {}, message };
    }

    if (!user.passwordHash) {
      const message = 'Spróbuj zalogować się za pomocą konta Google';
      return { success: false, errors: {}, message };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      const message = 'Nieprawidłowy email lub hasło';
      return { success: false, errors: {}, message };
    }

    const newSession = await createSession(user.id);
  } catch (error) {
    const message = 'Coś poszło nie tak. Spróbuj ponownie';
    return { success: false, errors: {}, message };
  }

  redirect('/');
}

export async function createGoogleAuthURL() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  cookies().set('state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TEN_MINUTES_IN_S,
    sameSite: 'lax',
  });

  cookies().set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TEN_MINUTES_IN_S,
    sameSite: 'lax',
  });

  let url;

  try {
    url = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ['profile', 'email'],
    });
  } catch (error) {
    return null;
  }

  redirect(url.toString());
}
