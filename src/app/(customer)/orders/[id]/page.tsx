// ============================================================
// HOBI Cuisine — Order Tracking Page
// ============================================================

'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ChefHat, Bell, Package, ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { getOrderById } from '@/db/operations';
import { broadcastService } from '@/services/broadcastService';
import { formatPrice, formatDateTime, getStatusInfo, getOrderTypeInfo, minutesElapsed } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import Link from 'next/link';

const statusSteps: { status: OrderStatus; icon: React.ElementType; label: string }[] = [
  { status: 'confirmed', icon: CheckCircle2, label: 'ยืนยันแล้ว' },
  { status: 'preparing', icon: ChefHat, label: 'กำลังเตรียมอาหาร' },
  { status: 'ready', icon: Bell, label: 'อาหารพร้อม' },
  { status: 'completed', icon: Package, label: 'เสร็จสมบูรณ์' },
];

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const data = await getOrderById(Number(id));
      setOrder(data || null);
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = broadcastService.on('ORDER_STATUS_UPDATE', async (event) => {
      const payload = event.payload as { orderId: number; status: OrderStatus };
      if (payload.orderId === Number(id)) {
        const updated = await getOrderById(Number(id));
        if (updated) setOrder(updated);
      }
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6e5cc]">
        <div className="w-8 h-8 border-2 border-[#88042b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f6e5cc]">
        <Package className="w-16 h-16 text-[#88042b]/40 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-[#88042b]">ไม่พบออเดอร์</h2>
        <Link href="/orders" className="text-[#c41e3a] hover:underline font-bold">กลับไปหน้าออเดอร์</Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const typeInfo = getOrderTypeInfo(order.orderType);
  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);
  const mins = minutesElapsed(order.createdAt);

  return (
    <div className="min-h-screen pb-24 bg-[#f6e5cc]">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#f6e5cc]/90 border-b border-[#88042b]/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/orders" className="p-2 hover:bg-[#88042b]/10 rounded-xl transition-colors text-[#88042b]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-[#88042b]">ติดตามออเดอร์</h1>
            <div className="text-xs text-[#c41e3a] font-mono font-bold">{order.orderNumber}</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#88042b]/10 rounded-2xl p-6 text-center shadow-sm"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bgColor} ${statusInfo.color} mb-3 shadow-sm`}>
            <Clock className="w-4 h-4" />
            {statusInfo.label}
          </div>
          <div className="text-3xl font-bold font-mono text-[#c41e3a] mb-1 drop-shadow-sm">
            {order.orderNumber}
          </div>
          <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
            {typeInfo.icon} {typeInfo.label}
            {order.tableNumber && ` • โต๊ะ ${order.tableNumber}`}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-md">{formatDateTime(order.createdAt)} • {mins} นาทีที่แล้ว</div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-[#88042b]/10 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#88042b] mb-6">สถานะการสั่ง</h3>
          <div className="space-y-0">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-4">
                  {/* Icon + Line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? [1, 1.1, 1] : 1,
                        backgroundColor: isCompleted ? '#22c55e' : '#f3f4f6', // green-500 or gray-100
                      }}
                      transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                      className="w-10 h-10 rounded-full flex items-center justify-center z-10 border border-gray-200 shadow-sm"
                    >
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    </motion.div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-2">
                    <div className={`font-bold text-sm ${isCompleted ? 'text-[#88042b]' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                    {isCurrent && order.status !== 'completed' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-bold text-green-600 mt-0.5 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 animate-spin" /> กำลังดำเนินการ...
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#88042b]/10 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#88042b] mb-4">รายการอาหาร</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#88042b]">{item.itemName}</div>
                  {item.selectedOptions.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.selectedOptions.map((o) => o.choice).join(', ')}
                    </div>
                  )}
                  {item.selectedAddons.length > 0 && (
                    <div className="text-xs text-gray-500">
                      +{item.selectedAddons.map((a) => a.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-700">x{item.quantity}</div>
                  <div className="text-xs font-medium text-gray-500">{formatPrice(item.price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-[#88042b]/10 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>ยอดรวม</span>
              <span className="font-medium text-black">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>ส่วนลด</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span className="font-medium text-black">{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>VAT 7%</span>
              <span className="font-medium text-black">{formatPrice(order.vat)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#88042b]/10 mt-2">
              <span className="text-[#88042b]">รวมทั้งหมด</span>
              <span className="text-[#c41e3a]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Points Earned */}
          {order.pointsEarned > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center shadow-sm">
              <span className="text-sm font-bold text-yellow-700">⭐ คุณได้รับ {order.pointsEarned} แต้มจากออเดอร์นี้!</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
