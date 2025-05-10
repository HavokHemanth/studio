"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import DashboardSidebarNav from '@/components/layout/DashboardSidebarNav';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account, isArtisan, isLoading } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !account) {
      router.replace('/'); // Or a login page
    } else if (!isLoading && account && !isArtisan) {
      router.replace('/'); // Not an artisan, redirect to homepage
    }
  }, [account, isArtisan, isLoading, router]);

  if (isLoading || !account || !isArtisan) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying artisan status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--navbar-height,80px))]"> {/* Adjust height based on actual Navbar height */}
      <DashboardSidebarNav />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  );
}

// Add this to your globals.css or a style tag in this layout if needed
// :root { --navbar-height: 80px; /* Or your actual navbar height */ }
// This is usually better handled if Navbar height is consistent and known.
// For this example, assuming a rough height and that the main app layout's padding handles the top space.
