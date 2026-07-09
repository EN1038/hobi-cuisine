'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, ChevronRight, History, Crown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getLoyaltyHistory } from '@/db/operations';
import { useAppStore } from '@/stores/appStore';
import { formatDateTime, getTierInfo } from '@/lib/utils';
import type { LoyaltyTransaction } from '@/types';
import Link from 'next/link';

export default function LoyaltyPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const dbReady = useAppStore((s) => s.dbReady);

  useEffect(() => {
    if (!dbReady) return;
    async function load() {
      if (user?.id) {
        const data = await getLoyaltyHistory(user.id);
        setTransactions(data);
      }
      setLoading(false);
    }
    load();
  }, [user, dbReady]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f6e5cc]">
        <Star className="w-16 h-16 text-[#88042b]/40 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-[#88042b]">ยังไม่ได้เข้าสู่ระบบ</h2>
        <p className="text-gray-600 mb-4 font-medium">เข้าสู่ระบบเพื่อดูแต้มสะสมและสิทธิพิเศษ</p>
        <Link href="/auth" className="px-6 py-3 bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-[#f6e5cc] rounded-xl font-bold shadow-md hover:scale-105 transition-transform">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-24 bg-[#f6e5cc] pt-20 px-4">
        <div className="bg-gray-200 rounded-3xl h-36 animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(user.loyaltyTier);

  return (
    <div className="min-h-screen pb-24 bg-[#f6e5cc]">
      {/* Header Card */}
      <div className="px-4 pt-6 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br ${tierInfo.gradient} shadow-lg`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)`,
            backgroundPosition: `0 0, 10px 10px`,
            backgroundSize: `20px 20px`,
          }} />
          <div className="absolute -right-4 -top-4 opacity-30">
            <Crown className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-xs font-bold text-[#88042b] border border-white/50 shadow-sm">
                {tierInfo.label}
              </span>
            </div>
            
            <div className="text-[#88042b] mb-1 font-bold">แต้มสะสมทั้งหมด</div>
            <div className="text-5xl font-black text-[#88042b] tracking-tight flex items-end gap-2 drop-shadow-sm">
              {user.loyaltyPoints} <span className="text-lg font-bold pb-2">แต้ม</span>
            </div>
            
            <div className="mt-6 flex justify-between items-center text-sm font-bold text-[#88042b]/80">
              <span>แลกแต้มเป็นส่วนลดได้เลย</span>
              <Link href="/promotions" className="flex items-center gap-1 hover:text-[#88042b] transition-colors">
                ดูสิทธิพิเศษ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 space-y-6">
        {/* Next Tier Progress (Mock) */}
        {user.loyaltyTier !== 'gold' && (
          <div className="bg-white rounded-2xl p-5 border border-[#88042b]/10 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">เลื่อนขั้นเป็น <span className="text-amber-500 font-bold">{user.loyaltyTier === 'bronze' ? 'Silver' : 'Gold'}</span></span>
              <span className="text-[#88042b] font-bold">150 / 500 แต้ม</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 w-[30%]" />
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">สะสมเพิ่มอีก 350 แต้ม เพื่อรับสิทธิพิเศษที่มากขึ้น</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/menu" className="bg-white p-4 rounded-2xl border border-[#88042b]/10 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-[#88042b]/30 shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#88042b]/10 text-[#88042b] group-hover:bg-[#88042b] group-hover:text-white transition-colors flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-[#88042b]">สั่งอาหารสะสมแต้ม</span>
          </Link>
          <Link href="/promotions" className="bg-white p-4 rounded-2xl border border-[#88042b]/10 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50 hover:border-yellow-500/30 shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-amber-700">แลกของรางวัล</span>
          </Link>
        </div>

        {/* Transaction History */}
        <div className="pb-8">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-[#88042b]">
            <History className="w-5 h-5" /> ประวัติแต้มสะสม
          </h3>
          
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-[#88042b]/10 animate-pulse rounded-xl shadow-sm" />)
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm font-medium">ยังไม่มีประวัติการสะสม/ใช้แต้ม</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-[#88042b]/10 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm mb-1 text-[#88042b]">{tx.description}</div>
                    <div className="text-xs text-gray-500 font-medium">{formatDateTime(tx.createdAt)}</div>
                  </div>
                  <div className={`font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
