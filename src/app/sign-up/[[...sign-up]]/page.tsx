
import { useIsMobile } from '@/hooks/use-mobile';
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-200">
      <SignUp />
      <div className="font-outline-4 absolute bottom-0 right-0 hidden p-3 text-9xl font-extrabold text-neutral-100 xl:block">
        Diagnosis
      </div>
    </div>
  );
}