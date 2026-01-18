'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract current locale from pathname
  const currentLocale = (pathname.split('/')[1] || 'en') as Locale;

  const handleLocaleChange = (locale: Locale) => {
    // Replace the locale in the current pathname
    const segments = pathname.split('/');
    segments[1] = locale;
    const newPath = segments.join('/');

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <span className="sm:hidden">{localeFlags[currentLocale]}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                    currentLocale === locale && 'bg-purple-50 text-brand-purple'
                  )}
                  role="menuitem"
                >
                  <span className="mr-3 text-lg">{localeFlags[locale]}</span>
                  <span className="flex-1 text-left">{localeNames[locale]}</span>
                  {currentLocale === locale && (
                    <Check className="w-4 h-4 text-brand-purple" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
