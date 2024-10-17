import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import Loading from '../loading';
import { Suspense } from 'react';
import { ClerkLoading, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen ">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold  ">Welcome Back</h1>
            <p className="mb-8  ">Please sign in to access your dashboard</p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white transition-colors duration-300 bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <ClerkLoading>
        <Loading />
      </ClerkLoading>
      <SignedIn>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Header />
            <main className="p-6">        <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
          </div>
        </div>
      </SignedIn>
    </>
  );
}