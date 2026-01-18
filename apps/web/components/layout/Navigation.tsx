'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Sparkles, Camera, Image, User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { Locale } from '@/i18n';

const navItems = [
  { href: '/dashboard', label: 'Try-On', icon: Camera },
  { href: '/dashboard/hair', label: 'Hair Styles', icon: Sparkles },
  { href: '/dashboard/nails', label: 'Nail Designs', icon: Sparkles },
  { href: '/dashboard/gallery', label: 'Gallery', icon: Image },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale = useMemo(() => {
    return pathname.split('/')[1] as Locale;
  }, [pathname]);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error('Failed to log out. Please try again.');
        console.error('Logout error:', error);
        return;
      }

      toast.success('Logged out successfully');
      router.push(`/${currentLocale}`);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUpgradeToPremium = () => {
    router.push(`/${currentLocale}/pricing`);
    toast.info('Redirecting to pricing...');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${currentLocale}/dashboard`} className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">BeautyTryOn</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const localizedHref = `/${currentLocale}${item.href}`;
              const isActive = pathname === localizedHref;
              return (
                <Link
                  key={item.href}
                  href={localizedHref}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-brand-purple'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgradeToPremium}
            >
              <span className="hidden sm:inline">Upgrade to</span> Premium
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center overflow-x-auto pb-2 space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const localizedHref = `/${currentLocale}${item.href}`;
            const isActive = pathname === localizedHref;
            return (
              <Link
                key={item.href}
                href={localizedHref}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-gradient-brand text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
