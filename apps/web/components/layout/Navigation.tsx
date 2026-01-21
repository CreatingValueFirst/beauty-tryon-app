'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Sparkles, Camera, Image, User, LogOut, Shirt, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';

const navItems = [
  { href: '/dashboard', labelKey: 'tryOn', icon: Camera },
  { href: '/dashboard/hair', labelKey: 'hair', icon: Sparkles },
  { href: '/dashboard/nails', labelKey: 'nails', icon: Sparkles },
  { href: '/dashboard/makeup', labelKey: 'makeup', icon: Palette },
  { href: '/dashboard/clothing-tryon', labelKey: 'clothing', icon: Shirt },
  { href: '/dashboard/gallery', labelKey: 'gallery', icon: Image },
  { href: '/dashboard/profile', labelKey: 'profile', icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');

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
        toast.error(t('logoutFailed'));
        console.error('Logout error:', error);
        return;
      }

      toast.success(t('loggedOut'));
      router.push(`/${currentLocale}`);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('logoutFailed'));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUpgradeToPremium = () => {
    router.push(`/${currentLocale}/pricing`);
    toast.info(t('redirectingToPricing'));
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={`/${currentLocale}/dashboard`}
            className="flex items-center min-h-[44px] touch-manipulation"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gradient">BeautyTryOn</h1>
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
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgradeToPremium}
              className="hidden sm:inline-flex min-h-[44px] touch-manipulation"
            >
              {t('upgradeToPremium')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              title={t('logout')}
              className="min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center overflow-x-auto pb-3 pt-1 space-x-2 scrollbar-hide -mx-3 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const localizedHref = `/${currentLocale}${item.href}`;
            const isActive = pathname === localizedHref;
            return (
              <Link
                key={item.href}
                href={localizedHref}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 touch-manipulation min-h-[44px] active:scale-95',
                  isActive
                    ? 'bg-gradient-brand text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
