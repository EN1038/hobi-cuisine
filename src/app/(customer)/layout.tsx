'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ConciergeBell, ReceiptText, Gift, UserRound, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const { user, isLoggedIn, logout, refreshUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn) {
      refreshUser();
    }
  }, [isLoggedIn, refreshUser]);

  const navItems = [
    { label: 'หน้าแรก', icon: Store, href: '/' },
    { label: 'เมนู', icon: ConciergeBell, href: '/menu' },
    { label: 'ออเดอร์', icon: ReceiptText, href: '/orders' },
    { label: 'แต้มสะสม', icon: Gift, href: '/loyalty' },
    { label: 'โปรไฟล์', icon: UserRound, href: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#f6e5cc] text-[#88042b]">
      {/* Top Navigation Bar (Desktop & Mobile) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-[#88042b]/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="relative h-10 w-32 flex items-center overflow-hidden group transition-transform hover:scale-105">
              <Image 
                src="/images/logo-section-2.png" 
                alt="HOBI Cuisine Logo" 
                fill
                className="object-contain object-left scale-[2.5] origin-left"
                style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(61%) saturate(5412%) hue-rotate(336deg) brightness(94%) contrast(109%)' }}
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-[#88042b]' : 'text-gray-600 hover:text-[#88042b]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-[#88042b] hover:scale-110 transition-transform group">
              <ShoppingCart className="w-6 h-6" />
              {mounted && cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#88042b] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white"
                >
                  {cartItemCount}
                </motion.div>
              )}
            </Link>

            {/* Auth / Avatar */}
            {mounted && isLoggedIn && user ? (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#88042b]">{user.name}</div>
                  <div className="text-xs font-semibold text-gray-500">{user.loyaltyPoints} แต้ม</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#88042b] flex items-center justify-center text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden md:flex px-4 py-2 bg-[#88042b] text-white text-sm font-bold rounded-full hover:bg-red-800 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 pb-20 md:pb-0 min-h-screen relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 group relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-[1px] w-8 h-[3px] bg-[#88042b] rounded-b-full"
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'text-[#88042b] scale-110' : 'text-gray-400 group-hover:text-[#88042b]'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold transition-colors ${
                    isActive ? 'text-[#88042b]' : 'text-gray-400 group-hover:text-[#88042b]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
