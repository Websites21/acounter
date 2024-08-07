'use client';

import { verifyEmailAction } from '@/actions/auth-actions';
import { type TVerifyEmailForm } from '@/lib/types';
import { cn } from '@/lib/utils';
import { verifyEmailSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();

  const userID = searchParams.get('userid');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TVerifyEmailForm>({ resolver: zodResolver(verifyEmailSchema) });

  async function onSubmit(data: TVerifyEmailForm) {
    const response = await verifyEmailAction(data, userID);

    if (response?.success === false) {
      if (response.errors.code?.length) {
        setError('code', {
          type: 'server',
          message: response.errors.code[0],
        });
      }
      if (response.message) {
        setError('root', {
          type: 'server',
          message: response.message,
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-md mx-auto'>
      <div className='space-y-4 mb-8'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-gray-200 text-sm' htmlFor='code'>
            Kod weryfikacyjny
          </label>
          <input
            className={cn(
              'text-gray-200 text-base bg-transparent border border-gray-700 py-2.5 px-4 rounded-lg placeholder:text-gray-500 placeholder:text-base',
              errors.code && 'border-red-400'
            )}
            type='text'
            id='code'
            placeholder='Wprowadź kod weryfikacyjny'
            {...register('code')}
          />
          {errors.code && (
            <p className='text-red-400 text-sm mt-1'>{errors.code.message}</p>
          )}
          {errors.root && (
            <p className='text-red-400 text-sm mt-1'>{errors.root.message}</p>
          )}
        </div>
      </div>
      <button
        className='bg-blue-600 mb-8 shadow-lg shadow-blue-600/40 w-full text-white rounded-lg font-semibold py-3 text-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-600/40'
        type='submit'
        disabled={isSubmitting}
      >
        Stwórz konto
      </button>
    </form>
  );
}
