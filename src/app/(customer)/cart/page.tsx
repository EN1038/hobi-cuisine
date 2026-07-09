'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, Tag, MapPin, MapPinned, Store, AlertCircle, X, ClipboardList, Star } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { getPromotionByCode } from '@/db/operations';
import { formatPrice } from '@/lib/utils';
import type { OrderType } from '@/types';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore();
  const { user } = useAuthStore();
  
  const [promoInput, setPromoInput] = useState(cart.promoCode);
  const [promoError, setPromoError] = useState('');
  
  // Need this to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoInput) {
      cart.clearPromo();
      return;
    }

    try {
      const promo = await getPromotionByCode(promoInput.toUpperCase());
      
      if (!promo) {
        setPromoError('ไม่พบรหัสส่วนลดนี้');
        return;
      }
      
      if (!promo.isActive) {
        setPromoError('รหัสส่วนลดนี้หมดอายุหรือไม่สามารถใช้งานได้');
        return;
      }
      
      const now = new Date().toISOString();
      if (now < promo.startDate || now > promo.endDate) {
        setPromoError('รหัสส่วนลดนี้ไม่อยู่ในช่วงเวลาที่กำหนด');
        return;
      }
      
      if (cart.getSubtotal() < promo.minOrderAmount) {
        setPromoError(`ต้องสั่งขั้นต่ำ ${formatPrice(promo.minOrderAmount)}`);
        return;
      }
      
      if (promo.tierRequired && user) {
        const tiers = { bronze: 1, silver: 2, gold: 3 };
        if (tiers[user.loyaltyTier] < tiers[promo.tierRequired]) {
          setPromoError(`รหัสนี้สำหรับสมาชิกระดับ ${promo.tierRequired} ขึ้นไปเท่านั้น`);
          return;
        }
      }

      // Calculate discount
      let discount = 0;
      if (promo.type === 'percentage') {
        discount = (cart.getSubtotal() * promo.value) / 100;
        if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
          discount = promo.maxDiscount;
        }
      } else if (promo.type === 'fixed_amount') {
        discount = promo.value;
      }
      
      cart.setPromo(promo.code, discount, promo.title);
      
    } catch {
      setPromoError('เกิดข้อผิดพลาดในการตรวจสอบรหัส');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 text-[#88042b]">ตะกร้าของคุณว่างเปล่า</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          ยังไม่มีรายการอาหารในตะกร้า ลองดูเมนูอาหารจีนแสนอร่อยของเราแล้วเพิ่มลงตะกร้าเลย
        </p>
        <Link 
          href="/menu"
          className="px-8 py-3.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a] rounded-xl font-bold text-[#f6e5cc] shadow-lg shadow-[#88042b]/20 hover:scale-105 transition-transform"
        >
          ไปที่หน้าเมนู
        </Link>
      </div>
    );
  }

  const subtotal = cart.getSubtotal();
  const pointsDiscount = cart.getPointsDiscount();
  const vat = cart.getVAT();
  const total = cart.getTotal();

  return (
    <div className="min-h-screen pb-28 md:pb-8 bg-[#f6e5cc]">
      {/* Header */}
      <div className="sticky top-[64px] z-40 bg-[#f6e5cc]/95 backdrop-blur-md px-4 py-4 border-b border-[#88042b]/10">
        <h1 className="text-xl font-bold text-center text-[#88042b]">ตะกร้าของคุณ ({cart.getItemCount()})</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Items & Delivery Info */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Order Type Selection */}
          <div className="bg-white border border-[#88042b]/10 rounded-2xl p-1 flex shadow-sm">
            {[
              { type: 'dine-in' as OrderType, label: 'ทานที่ร้าน', icon: Store },
              { type: 'takeaway' as OrderType, label: 'สั่งกลับบ้าน', icon: MapPin },
              { type: 'delivery' as OrderType, label: 'จัดส่ง', icon: MapPinned },
            ].map(ot => (
              <button
                key={ot.type}
                onClick={() => cart.setOrderType(ot.type)}
                className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-xl transition-all ${
                  cart.orderType === ot.type 
                    ? 'bg-[#88042b] text-[#f6e5cc] shadow-md' 
                    : 'text-gray-500 hover:bg-[#88042b]/5 hover:text-[#88042b]'
                }`}
              >
                <ot.icon className="w-4 h-4" />
                <span>{ot.label}</span>
              </button>
            ))}
          </div>

          {/* Conditional Inputs based on Order Type */}
          <AnimatePresence mode="wait">
            {cart.orderType === 'dine-in' && (
              <motion.div
                key="dine-in"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-4">
                  <label className="text-sm font-bold text-[#88042b] mb-2 block">หมายเลขโต๊ะ (ถ้ามี)</label>
                  <input
                    type="text"
                    value={cart.tableNumber}
                    onChange={(e) => cart.setTableNumber(e.target.value)}
                    placeholder="เช่น A1, 15"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50"
                  />
                </div>
              </motion.div>
            )}

            {cart.orderType === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-4">
                  <label className="text-sm font-bold text-[#88042b] mb-2 block">ที่อยู่สำหรับจัดส่ง <span className="text-red-500">*</span></label>
                  <textarea
                    value={cart.deliveryAddress}
                    onChange={(e) => cart.setDeliveryAddress(e.target.value)}
                    placeholder="กรอกที่อยู่สำหรับจัดส่ง..."
                    className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 resize-none"
                  />
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>* มีค่าจัดส่งเพิ่มเติม {formatPrice(40)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart Items */}
          <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#88042b]/10 bg-gray-50/50">
              <h2 className="font-bold text-[#88042b]">รายการอาหาร</h2>
            </div>
            <div className="divide-y divide-[#88042b]/5">
              <AnimatePresence>
                {cart.items.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    className="p-4 flex gap-4 bg-white"
                  >
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-sm text-[#88042b] truncate pr-2">{item.name}</h3>
                        <span className="font-bold text-[#c41e3a] shrink-0">{formatPrice(item.totalPrice)}</span>
                      </div>
                      
                      {/* Options & Addons */}
                      <div className="text-xs text-gray-600 mb-3 space-y-0.5">
                        {item.selectedOptions.map(o => (
                          <div key={o.optionName}>• {o.optionName}: {o.choice}</div>
                        ))}
                        {item.selectedAddons.map(a => (
                          <div key={a.name}>+ {a.name}</div>
                        ))}
                        {item.specialInstructions && (
                          <div className="text-orange-600 mt-1 flex gap-1"><span className="shrink-0">📝</span> <span>{item.specialInstructions}</span></div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg">
                          <button 
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="w-8 text-center text-sm font-bold text-[#88042b]">{item.quantity}</div>
                          <button 
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => cart.removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Notes */}
          <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-[#88042b]">
              <ClipboardList className="w-4 h-4" /> หมายเหตุถึงร้านอาหาร
            </h2>
            <textarea
              value={cart.notes}
              onChange={(e) => cart.setNotes(e.target.value)}
              placeholder="เช่น ขอช้อนส้อม, ไม่รับใบเสร็จ, ฯลฯ"
              className="w-full h-20 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 resize-none"
            />
          </div>

        </div>

        {/* Right Col: Summary & Payment */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Promo Code */}
          <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-[#88042b]">
              <Tag className="w-4 h-4" /> โค้ดส่วนลด
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="กรอกโค้ดส่วนลด"
                disabled={!!cart.promoCode}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm uppercase text-black placeholder:text-gray-400 focus:outline-none focus:border-[#88042b]/50 disabled:opacity-50"
              />
              {cart.promoCode ? (
                <button
                  onClick={() => { cart.clearPromo(); setPromoInput(''); }}
                  className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                >
                  ยกเลิก
                </button>
              ) : (
                <button
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 bg-[#88042b]/10 text-[#88042b] border border-[#88042b]/20 rounded-xl text-sm font-bold hover:bg-[#88042b]/20 transition-colors"
                >
                  ใช้โค้ด
                </button>
              )}
            </div>
            
            {promoError && (
              <div className="mt-2 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {promoError}
              </div>
            )}
            
            {cart.promoDescription && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                ✅ {cart.promoDescription} (-{formatPrice(cart.promoDiscount)})
              </div>
            )}
          </div>

          {/* Points Redemption */}
          {user && user.loyaltyPoints > 0 && (
            <div className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold flex items-center gap-2 text-[#88042b]">
                  <Star className="w-4 h-4 text-[#c41e3a]" /> ใช้แต้มเป็นส่วนลด
                </h2>
                <div className="text-xs text-gray-500 font-medium">
                  มี {user.loyaltyPoints} แต้ม
                </div>
              </div>
              
              <label className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black">ใช้ {Math.min(user.loyaltyPoints, subtotal * 10)} แต้ม</span>
                  <span className="text-xs font-bold text-green-600">
                    ลดได้ {formatPrice(Math.min(user.loyaltyPoints * 0.1, subtotal))}
                  </span>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300 border border-gray-300 shadow-inner">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    checked={cart.usePoints}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const maxPointsToUse = Math.min(user.loyaltyPoints, subtotal * 10);
                        cart.setUsePoints(true, maxPointsToUse);
                      } else {
                        cart.setUsePoints(false, 0);
                      }
                    }}
                  />
                  <span className={`absolute cursor-pointer top-[1px] left-[1px] bottom-[1px] w-5 rounded-full shadow-sm transition-all duration-300 ${cart.usePoints ? 'transform translate-x-6 bg-white' : 'bg-white'}`} />
                  <div className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 ${cart.usePoints ? 'bg-[#c41e3a]' : 'bg-transparent'}`} />
                </div>
              </label>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-[#88042b] shadow-xl rounded-2xl p-5 sticky top-[140px] text-[#f6e5cc]">
            <h2 className="font-bold mb-4 text-lg">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#f6e5cc]/80">
                <span>ยอดรวมอาหาร</span>
                <span className="font-medium text-[#f6e5cc]">{formatPrice(subtotal)}</span>
              </div>
              
              {cart.promoDiscount > 0 && (
                <div className="flex justify-between text-green-300 font-bold">
                  <span>ส่วนลดโปรโมชั่น</span>
                  <span>-{formatPrice(cart.promoDiscount)}</span>
                </div>
              )}
              
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-300 font-bold">
                  <span>ส่วนลดจากแต้ม</span>
                  <span>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}
              
              {cart.deliveryFee > 0 && (
                <div className="flex justify-between text-[#f6e5cc]/80">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-[#f6e5cc]">{formatPrice(cart.deliveryFee)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-[#f6e5cc]/70">
                <span>ภาษีมูลค่าเพิ่ม 7%</span>
                <span>{formatPrice(vat)}</span>
              </div>
              
              <div className="pt-4 border-t border-[#f6e5cc]/20 flex justify-between items-end">
                <span className="font-bold text-lg">รวมทั้งหมด</span>
                <span className="text-3xl font-bold text-white drop-shadow-sm">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {user ? (
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-[#f6e5cc] hover:bg-white text-[#88042b] font-bold text-lg rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  ดำเนินการชำระเงิน
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-center text-[#f6e5cc]/80 font-medium">กรุณาเข้าสู่ระบบเพื่อสั่งอาหาร</p>
                  <Link
                    href="/auth"
                    className="block w-full py-3.5 bg-white/10 hover:bg-white/20 text-[#f6e5cc] font-bold text-center rounded-xl transition-all border border-[#f6e5cc]/20"
                  >
                    เข้าสู่ระบบ / สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
