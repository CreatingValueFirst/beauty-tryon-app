'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = pathname.split('/')[1] as Locale;

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    setIsOpen(false);
    router.push(newPath);
    router.refresh(); // Force reload to apply new translations
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 min-h-[44px] px-2 sm:px-3"
        >
          <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline text-sm">
            {localeNames[currentLocale]}
          </span>
          <span className="text-base sm:text-lg">{localeFlags[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 sm:w-56"
        sideOffset={8}
      >
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className="min-h-[48px] cursor-pointer touch-manipulation gap-3 px-4 py-3"
          >
            <span className="text-xl sm:text-2xl">{localeFlags[locale]}</span>
            <span className="flex-1 text-sm sm:text-base font-medium">{localeNames[locale]}</span>
            {currentLocale === locale && (
              <span className="text-base text-brand-purple font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
