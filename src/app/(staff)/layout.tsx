'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChefHat, MonitorSmartphone, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'KDS (ห้องครัว)', icon: ChefHat, href: '/kitchen' },
    { label: 'POS (หน้าร้าน)', icon: MonitorSmartphone, href: '/pos' },
    { label: 'Admin (ผู้จัดการ)', icon: BarChart3, href: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)] flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Topbar for Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#88042b]/10 flex flex-col shrink-0 shadow-md z-20">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between md:justify-start gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image src="/images/logo-section-hero.png" alt="HOBI Logo" fill className="object-contain" />
            </div>
            <div className="hidden md:block">
              <div className="font-black text-[#88042b] group-hover:text-[#c41e3a] transition-colors">HOBI Cuisine</div>
              <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Staff Portal</div>
            </div>
          </Link>
          <Link href="/" className="md:hidden p-2 text-gray-400 hover:text-[#88042b] bg-gray-50 rounded-lg border border-gray-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap font-bold ${
                  isActive
                    ? 'bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-white shadow-md shadow-red-900/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#88042b] border border-transparent hover:border-[#88042b]/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 transition-colors w-full border border-transparent hover:border-red-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">กลับสู่หน้าร้าน</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-80px)] md:h-screen">
        {children}
      </main>
    </div>
  );
}
