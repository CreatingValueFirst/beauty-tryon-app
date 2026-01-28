'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, Camera, Image, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'tryon', label: 'Try-On', icon: Sparkles, href: '/dashboard/hair' },
  { id: 'camera', label: 'Camera', icon: Camera, href: '/dashboard/camera', isCenter: true },
  { id: 'gallery', label: 'Gallery', icon: Image, href: '/dashboard/gallery' },
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getActiveTab = () => {
    const path = pathname.replace(/^\/[a-z]{2}/, ''); // Remove locale prefix

    if (path === '/dashboard' || path === '/dashboard/') return 'home';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/camera')) return 'camera';
    if (path.includes('/hair') || path.includes('/nails') || path.includes('/makeup') || path.includes('/clothing')) return 'tryon';

    return 'home';
  };

  const activeTab = getActiveTab();

  const handleNavClick = (item: NavItem) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Get current locale from pathname
    const locale = pathname.split('/')[1] || 'en';
    router.push(`/${locale}${item.href}`);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50" />

          {/* Safe area padding for iPhone */}
          <div className="relative flex items-center justify-around px-2 pt-2 pb-safe">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.isCenter) {
                // Center Camera FAB
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    whileTap={{ scale: 0.9 }}
                    className="relative -mt-8"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-60 animate-pulse" />

                    {/* Button */}
                    <div className={cn(
                      "relative w-16 h-16 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600",
                      "shadow-lg shadow-purple-500/30",
                      "border-4 border-white",
                      "transition-transform duration-200"
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-30" />
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200",
                    "min-w-[64px] min-h-[56px]",
                    isActive
                      ? "text-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-colors",
                      isActive && "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    )} />
                  </motion.div>

                  <span className={cn(
                    "text-[10px] font-medium mt-1 transition-colors",
                    isActive ? "text-purple-600" : "text-gray-500"
                  )}>
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-purple-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
