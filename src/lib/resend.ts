import 'server-only';
import { Resend } from 'resend';
import VerifyEmail from '@/emails/verify-email';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationEmail(code: string) {
  await resend.emails.send({
    from: 'Acounter <onboarding@resend.dev>',
    to: 'delivered@resend.dev',
    subject: 'Zweryfikuj swój adres email',
    react: VerifyEmail({ code }),
  });
}
