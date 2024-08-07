import 'server-only';
import prisma from './prisma';
import crypto from 'crypto';
import { ONE_DAY_IN_MS, ONE_DAY_IN_S, ONE_HOUR_IN_MS } from './contstants';
import { cookies } from 'next/headers';

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function upsertUser(
  name: string,
  email: string,
  passwordHash: string,
  image?: string
) {
  return await prisma.user.upsert({
    where: { email },
    create: { name, email, passwordHash, image },
    update: { name, email, passwordHash, image },
  });
}

export function generateCode() {
  const min = 100000;
  const max = 999999;

  return crypto.randomInt(min, max + 1).toString();
}

export async function createVerificationToken(code: string, userID: string) {
  return await prisma.verificationToken.create({
    data: {
      code,
      userID,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    },
  });
}

export async function getVerificationTokenByCodeAndUserID(
  code: string,
  userID: string
) {
  return await prisma.verificationToken.findUnique({
    where: {
      code_userID: {
        code,
        userID,
      },
    },
  });
}

export async function getUserByID(userID: string) {
  return await prisma.user.findUnique({
    where: { id: userID },
  });
}

export async function updateUserEmailVerifiedByID(userID: string) {
  return await prisma.user.update({
    where: { id: userID },
    data: { emailVerified: true },
  });
}

export async function createSession(userID: string) {
  const session = await prisma.session.create({
    data: {
      userID,
      expiresAt: new Date(Date.now() + ONE_DAY_IN_MS),
    },
  });

  cookies().set('auth_token', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_DAY_IN_S,
    sameSite: 'lax',
  });
}

export async function verifySession() {
  const sessionID = cookies().get('auth_token')?.value;

  if (!sessionID) return null;

  try {
    const session = await getSessionByID(sessionID);

    if (!session) return null;

    const isActive = session.expiresAt > new Date();
    if (!isActive) return null;

    return session;
  } catch (error) {
    return null;
  }
}

export async function getSessionByID(sessionID: string) {
  return await prisma.session.findUnique({
    where: { id: sessionID },
  });
}

export async function deleteSessionByID(sessionID: string) {
  return await prisma.session.delete({
    where: { id: sessionID },
  });
}
