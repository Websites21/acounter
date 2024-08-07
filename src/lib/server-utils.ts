import 'server-only';
import prisma from './prisma';
import crypto from 'crypto';
import { ONE_HOUR_IN_MS } from './contstants';

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
