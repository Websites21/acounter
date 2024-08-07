import { logoutAction } from '@/actions/auth-actions';
import { getUserByID, verifySession } from '@/lib/server-utils';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await verifySession();

  if (!session) redirect('/login');

  const user = await getUserByID(session.userID);

  if (!user) redirect('/login');

  return (
    <section className='text-center px-4 sm:px-8'>
      <h1 className='text-gray-200 text-4xl font-semibold mb-8'>Home 🏠</h1>
      <div className='flex items-center gap-3 text-left w-max mx-auto mb-8'>
        {user.image ? (
          <Image
            className='size-12 rounded-full border border-gray-700'
            src={user.image}
            alt='Zdjęcie profilowe'
            width={48}
            height={48}
          />
        ) : (
          <span className='size-12 bg-gray-800 rounded-full border border-gray-700 flex justify-center items-center text-xl text-gray-200'>
            {user.name[0].toUpperCase()}
          </span>
        )}
        <div>
          <p className='text-sm font-semibold text-gray-200'>{user.name}</p>
          <p className='text-sm text-gray-200'>{user.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          className='border border-gray-700 text-gray-200 rounded-lg font-semibold px-12 py-3 text-lg hover:bg-gray-900 transition-all duration-300'
          type='submit'
        >
          Wyloguj się
        </button>
      </form>
    </section>
  );
}
