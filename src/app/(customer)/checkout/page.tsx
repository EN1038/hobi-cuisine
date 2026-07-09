// ============================================================
// HOBI Cuisine — Checkout & Payment Page
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, QrCode, Banknote, CheckCircle2, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { createOrder } from '@/services/orderService';
import { processPayment, getPaymentMethodName } from '@/services/paymentService';
import { formatPrice } from '@/lib/utils';
import type { PaymentMethod } from '@/types';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore();
  const { user } = useAuthStore();


  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('promptpay');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!user) {
    router.push('/auth');
    return null;
  }

  if (cart.items.length === 0 && step !== 'success') {
    router.push('/cart');
    return null;
  }

  const subtotal = cart.getSubtotal();
  const pointsDiscount = cart.getPointsDiscount();
  const vat = cart.getVAT();
  const total = cart.getTotal();

  const handlePayment = async () => {
    setStep('processing');

    try {
      // Simulate payment
      await processPayment(selectedMethod, total);

      // Create order
      const order = await createOrder({
        userId: user!.id!,
        userName: user!.name,
        items: cart.items,
        orderType: cart.orderType,
        tableNumber: cart.tableNumber || undefined,
        deliveryAddress: cart.deliveryAddress || undefined,
        deliveryFee: cart.deliveryFee,
        subtotal,
        discount: cart.promoDiscount + pointsDiscount,
        promoCode: cart.promoCode || undefined,
        promoDescription: cart.promoDescription || undefined,
        pointsRedeemed: cart.pointsToRedeem,
        pointsDiscount,
        vat,
        total,
        paymentMethod: selectedMethod,
        notes: cart.notes || undefined,
      });

      setOrderNumber(order.orderNumber);
      setOrderId(order.id!);
      setStep('success');

      // Clear cart
      cart.clearCart();

      // Refresh user data
      const { refreshUser } = useAuthStore.getState();
      await refreshUser();
    } catch {
      setStep('select');
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const paymentMethods = [
    { method: 'promptpay' as PaymentMethod, icon: QrCode, label: 'พร้อมเพย์ QR', desc: 'สแกน QR ชำระเงิน' },
    { method: 'credit_card' as PaymentMethod, icon: CreditCard, label: 'บัตรเครดิต/เดบิต', desc: 'Visa, Mastercard' },
    { method: 'cash' as PaymentMethod, icon: Banknote, label: 'เงินสด', desc: 'ชำระที่ร้าน' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step === 'select' && (
            <Link href="/cart" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="text-lg font-semibold">
            {step === 'select' ? 'ชำระเงิน' : step === 'processing' ? 'กำลังดำเนินการ...' : 'สำเร็จ!'}
          </h1>
          <div className="ml-auto px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
            DEMO MODE
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Payment */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm text-gray-400 mb-3">สรุปคำสั่งซื้อ</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">ยอดรวม ({cart.getItemCount()} รายการ)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {cart.promoDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>ส่วนลดโปร ({cart.promoCode})</span>
                      <span>-{formatPrice(cart.promoDiscount)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>ส่วนลดแต้ม ({cart.pointsToRedeem} แต้ม)</span>
                      <span>-{formatPrice(pointsDiscount)}</span>
                    </div>
                  )}
                  {cart.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">ค่าจัดส่ง</span>
                      <span>{formatPrice(cart.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-300">VAT 7%</span>
                    <span>{formatPrice(vat)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg">
                    <span>รวมทั้งหมด</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-sm text-gray-400 mb-3">เลือกวิธีชำระเงิน</h2>
                <div className="space-y-3">
                  {paymentMethods.map(({ method, icon: Icon, label, desc }) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                        selectedMethod === method
                          ? 'border-yellow-500/50 bg-yellow-500/10 shadow-lg shadow-yellow-500/5'
                          : 'border-white/10 bg-gray-900/40 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${selectedMethod === method ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                        <Icon className={`w-6 h-6 ${selectedMethod === method ? 'text-yellow-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                      <div className="ml-auto">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedMethod === method ? 'border-yellow-400 bg-yellow-400' : 'border-gray-600'
                        }`}>
                          {selectedMethod === method && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Card Form */}
              {selectedMethod === 'credit_card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4"
                >
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">หมายเลขบัตร</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">วันหมดอายุ</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/^(.{2})/, '$1/'))}
                        placeholder="MM/YY"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-400 mb-1 block">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
                        placeholder="•••"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ข้อมูลบัตรปลอดภัย — Demo Mode (ใช้เลขอะไรก็ได้)</span>
                  </div>
                </motion.div>
              )}

              {/* PromptPay QR */}
              {selectedMethod === 'promptpay' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center"
                >
                  <div className="inline-block p-6 bg-white rounded-2xl mb-3">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-800" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">สแกน QR Code เพื่อชำระเงิน</p>
                  <p className="text-xs text-yellow-500 mt-1">* Demo Mode — กดปุ่มด้านล่างเพื่อจำลองการชำระ</p>
                </motion.div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="w-full py-4 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                ชำระเงิน {formatPrice(total)}
              </button>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Loader2 className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">กำลังดำเนินการชำระเงิน...</h2>
                <p className="text-gray-400">{getPaymentMethodName(selectedMethod)}</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-14 h-14 text-green-400" />
              </motion.div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">ชำระเงินสำเร็จ! 🎉</h2>
                <p className="text-gray-400">ขอบคุณที่ใช้บริการ HOBI Cuisine</p>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full text-center space-y-3">
                <div className="text-sm text-gray-400">เลขออเดอร์ของคุณ</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 font-mono">
                  {orderNumber}
                </div>
                <div className="text-sm text-gray-400">กรุณาแจ้งเลขนี้เมื่อรับอาหาร</div>
              </div>

              <div className="flex gap-3 w-full">
                <Link
                  href={`/orders/${orderId}`}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-semibold rounded-xl text-center transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                >
                  ติดตามออเดอร์
                </Link>
                <Link
                  href="/menu"
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl text-center transition-all hover:bg-white/10"
                >
                  สั่งเพิ่ม
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
