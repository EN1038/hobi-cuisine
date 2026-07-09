'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Copy, Check, Clock } from 'lucide-react';
import { getActivePromotions } from '@/db/operations';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, getTierInfo } from '@/lib/utils';
import type { Promotion } from '@/types';

export default function PromotionsPage() {
  const { user } = useAuthStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const promos = await getActivePromotions();
      setPromotions(promos);
      setLoading(false);
    }
    load();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f6e5cc]">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#88042b]">
          <Tag className="w-6 h-6 text-[#88042b]" /> โปรโมชั่นและสิทธิพิเศษ
        </h1>
        <p className="text-gray-600 text-sm mt-1 font-medium">
          คุ้มกว่าด้วยโค้ดส่วนลดและโปรโมชั่นพิเศษสำหรับคุณ
        </p>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-[#88042b]/10 shadow-sm animate-pulse rounded-2xl" />)
        ) : promotions.length === 0 ? (
          <div className="text-center py-12 text-gray-600 font-medium">
            ยังไม่มีโปรโมชั่นในช่วงนี้
          </div>
        ) : (
          promotions.map((promo, idx) => {
            const isEligible = !promo.tierRequired || (user && getTierLevel(user.loyaltyTier) >= getTierLevel(promo.tierRequired));
            const endDate = new Date(promo.endDate);
            const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border transition-all ${
                  isEligible ? 'bg-white border-[#88042b]/20 shadow-md' : 'bg-gray-50 border-gray-200 opacity-80 shadow-sm'
                }`}
              >
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isEligible ? 'bg-gradient-to-b from-[#88042b] to-[#c41e3a]' : 'bg-gray-300'
                }`} />

                <div className="p-5 pl-7 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-lg leading-tight ${isEligible ? 'text-[#88042b]' : 'text-gray-600'}`}>{promo.title}</h3>
                      {promo.tierRequired && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white shadow-sm border border-gray-100 ${getTierInfo(promo.tierRequired).color}`}>
                          {getTierInfo(promo.tierRequired).label}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{promo.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>เหลือ {daysLeft} วัน</span>
                      </div>
                      <div>ขั้นต่ำ {formatPrice(promo.minOrderAmount)}</div>
                    </div>
                  </div>

                  <div className="md:w-48 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                    {isEligible ? (
                      <button
                        onClick={() => copyCode(promo.code)}
                        className={`w-full py-3 rounded-xl font-mono font-bold tracking-wider text-center transition-all flex items-center justify-center gap-2 ${
                          copiedCode === promo.code
                            ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
                            : 'bg-[#88042b]/5 text-[#88042b] border border-[#88042b]/20 hover:bg-[#88042b]/10 hover:shadow-sm'
                        }`}
                      >
                        {copiedCode === promo.code ? (
                          <><Check className="w-4 h-4" /> คัดลอกแล้ว</>
                        ) : (
                          <><Copy className="w-4 h-4" /> {promo.code}</>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 text-center text-sm font-bold shadow-inner">
                        สิทธิเฉพาะ {promo.tierRequired ? getTierInfo(promo.tierRequired).label : ''} ขึ้นไป
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getTierLevel(tier: string) {
  if (tier === 'gold') return 3;
  if (tier === 'silver') return 2;
  return 1;
}
