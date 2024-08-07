import LoginForm from '@/components/login-form';
import { verifySession } from '@/lib/server-utils';
import { redirect } from 'next/navigation';

export default async function Login() {
  const session = await verifySession();

  if (session) redirect('/');

  return (
    <section className='px-4 sm:px-8'>
      <h1 className='text-gray-200 text-4xl font-semibold text-center mb-4'>
        Logowanie 🔑
      </h1>
      <p className='text-gray-200 text-lg text-center mb-8'>
        Zaloguj się, aby wejść na swoje konto.
      </p>
      <LoginForm />
    </section>
  );
}
