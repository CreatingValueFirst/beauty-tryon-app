import { Navigation } from '@/components/layout/Navigation';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { GamificationProvider } from '@/components/gamification/GamificationProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GamificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </GamificationProvider>
  );
}
