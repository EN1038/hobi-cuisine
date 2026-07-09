'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, LogOut, Settings, Bell, ChevronRight, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getTierInfo } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-8 text-center bg-[#f6e5cc]">
        <User className="w-16 h-16 text-[#88042b]/40 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-[#88042b]">ยังไม่ได้เข้าสู่ระบบ</h2>
        <p className="text-gray-600 mb-4 font-medium">เข้าสู่ระบบเพื่อจัดการโปรไฟล์ของคุณ</p>
        <Link href="/auth" className="px-6 py-3 bg-gradient-to-r from-[#88042b] to-[#c41e3a] rounded-xl font-bold text-[#f6e5cc] shadow-md hover:scale-105 transition-transform">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuGroups = [
    {
      title: 'บัญชีของฉัน',
      items: [
        { icon: User, label: 'ข้อมูลส่วนตัว', href: '#', value: user.name },
        { icon: Mail, label: 'อีเมล', href: '#', value: user.email },
        { icon: Phone, label: 'เบอร์โทรศัพท์', href: '#', value: user.phone || 'ยังไม่ระบุ' },
        { icon: MapPin, label: 'ที่อยู่จัดส่ง', href: '#', value: 'จัดการที่อยู่' },
      ]
    },
    {
      title: 'การตั้งค่า',
      items: [
        { icon: Bell, label: 'การแจ้งเตือน', href: '#', value: 'เปิด' },
        { icon: Shield, label: 'ความเป็นส่วนตัว', href: '#', value: '' },
        { icon: Settings, label: 'ตั้งค่าแอป', href: '#', value: '' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-24 bg-[#f6e5cc]">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#88042b]">โปรไฟล์ของฉัน</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#88042b]/10 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#88042b] to-[#c41e3a] p-1 shrink-0 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#88042b]">
              {user.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate mb-1 text-[#88042b]">{user.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getTierInfo(user.loyaltyTier).color} shadow-sm`}>
                {getTierInfo(user.loyaltyTier).label}
              </span>
              <span className="text-sm font-medium text-gray-600">{user.loyaltyPoints} แต้ม</span>
            </div>
          </div>
        </div>

        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
          <div key={idx} className="bg-white border border-[#88042b]/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-[#88042b]/5 text-xs font-bold text-gray-500 tracking-wider">
              {group.title}
            </div>
            <div className="divide-y divide-[#88042b]/5">
              {group.items.map((item, i) => (
                <button key={i} className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#88042b] shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-[#88042b]">{item.label}</div>
                  </div>
                  {item.value && (
                    <div className="text-xs font-medium text-gray-500 max-w-[120px] truncate">
                      {item.value}
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Admin/POS Portal Links (Demo only) */}
        {user.role === 'admin' && (
          <div className="bg-emerald-50 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-emerald-100/50 text-xs font-bold text-emerald-700 tracking-wider border-b border-emerald-500/10">
              เมนูสำหรับพนักงาน (Demo)
            </div>
            <div className="divide-y divide-emerald-500/10">
              <Link href="/kitchen" className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-emerald-100 transition-colors">
                <span className="text-sm font-bold text-emerald-700">เข้าสู่ระบบห้องครัว (KDS)</span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link href="/pos" className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-emerald-100 transition-colors">
                <span className="text-sm font-bold text-emerald-700">เข้าสู่ระบบหน้าร้าน (POS)</span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link href="/admin" className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-emerald-100 transition-colors">
                <span className="text-sm font-bold text-emerald-700">เข้าสู่ระบบผู้จัดการ (Admin)</span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-4 pb-8">
          {showLogoutConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-sm font-bold text-[#88042b] mb-4">คุณต้องการออกจากระบบใช่หรือไม่?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-[#c41e3a] rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-4 bg-white hover:bg-red-50 border border-[#88042b]/20 hover:border-red-200 rounded-2xl text-[#c41e3a] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-5 h-5" /> ออกจากระบบ
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
