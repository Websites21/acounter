import SignupForm from '@/components/signup-form';

export default function Signup() {
  return (
    <section className='px-4 sm:px-8'>
      <h1 className='text-gray-200 text-4xl font-semibold text-center mb-4'>
        Rejestracja 🔑
      </h1>
      <p className='text-gray-200 text-lg text-center mb-8'>
        Zacznij swój 30-dniowy darmowy okres próbny.
      </p>
      <SignupForm />
    </section>
  );
}
