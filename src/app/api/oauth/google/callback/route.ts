import { google } from '@/lib/oauth';
import { sendWelcomeEmail } from '@/lib/resend';
import {
  createSession,
  getUserByEmail,
  updateUserEmailVerifiedByID,
  upsertUser,
} from '@/lib/server-utils';
import { TGoogleUser } from '@/lib/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const codeVerifier = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  const codeVerifierCookie = cookies().get('code_verifier')?.value;
  const stateCookie = cookies().get('state')?.value;

  if (!codeVerifier || !codeVerifierCookie || !state || !stateCookie) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  if (state !== stateCookie) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const { accessToken } = await google.validateAuthorizationCode(
    codeVerifier,
    codeVerifierCookie
  );

  const response = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const googleUser: TGoogleUser = await response.json();
  const userExists = await getUserByEmail(googleUser.email);

  if (userExists) {
    const newSession = await createSession(userExists.id);
  } else {
    const user = await upsertUser(
      googleUser.name,
      googleUser.email,
      undefined,
      googleUser.picture
    );
    const newSession = await createSession(user.id);
    const updatedUser = await updateUserEmailVerifiedByID(user.id);
    await sendWelcomeEmail(user.name);
  }

  redirect('/');
}
