import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import Loading from '../loading';
import { Suspense } from 'react';
import { SignedIn } from '@clerk/nextjs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}