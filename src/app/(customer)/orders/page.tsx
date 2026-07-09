// ============================================================
// HOBI Cuisine — Order History Page
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ChevronRight, Package, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getOrdersByUser } from '@/db/operations';
import { formatPrice, formatDateTime, getStatusInfo, getOrderTypeInfo } from '@/lib/utils';
import type { Order } from '@/types';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) return;
      const data = await getOrdersByUser(user.id);
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f6e5cc]">
        <ClipboardList className="w-16 h-16 text-[#88042b]/40 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-[#88042b]">ยังไม่ได้เข้าสู่ระบบ</h2>
        <p className="text-gray-600 mb-4 font-medium">เข้าสู่ระบบเพื่อดูประวัติออเดอร์</p>
        <Link href="/auth" className="px-6 py-3 bg-gradient-to-r from-[#88042b] to-[#c41e3a] rounded-xl font-bold text-[#f6e5cc] shadow-md hover:scale-105 transition-transform">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <div className="min-h-screen pb-24 bg-[#f6e5cc]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#88042b]">ออเดอร์ของฉัน</h1>
        <p className="text-gray-600 text-sm font-medium mt-1">ติดตามและดูประวัติการสั่งอาหาร</p>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6 flex gap-2">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'active', label: 'กำลังดำเนินการ' },
          { key: 'completed', label: 'เสร็จแล้ว' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
              filter === f.key
                ? 'bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-[#f6e5cc]'
                : 'bg-white border border-[#88042b]/20 text-[#88042b] hover:bg-red-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-sm border border-[#88042b]/10 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Package className="w-16 h-16 text-[#88042b]/40 mb-4" />
            <h3 className="text-lg font-bold text-[#88042b]">ยังไม่มีออเดอร์</h3>
            <p className="text-gray-600 text-sm mb-6 font-medium">เริ่มสั่งอาหารเลย!</p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-gradient-to-r from-[#88042b] to-[#c41e3a] rounded-xl font-bold text-[#f6e5cc] shadow-md hover:scale-105 transition-transform"
            >
              ดูเมนู
            </Link>
          </motion.div>
        ) : (
          filteredOrders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            const typeInfo = getOrderTypeInfo(order.orderType);
            const isActive = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/orders/${order.id}`}
                  className={`block bg-white border rounded-2xl p-5 transition-all shadow-sm hover:shadow-md ${
                    isActive ? 'border-[#c41e3a]/50 bg-red-50/30' : 'border-[#88042b]/10 hover:border-[#88042b]/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-mono font-bold text-sm text-[#c41e3a]">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">{formatDateTime(order.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-2 font-medium">
                    {order.items.slice(0, 3).map((item) => `${item.itemName} x${item.quantity}`).join(', ')}
                    {order.items.length > 3 && ` +${order.items.length - 3} รายการ`}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1">{typeInfo.icon} {typeInfo.label}</span>
                    <span className="font-bold text-[#88042b]">{formatPrice(order.total)}</span>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-[#88042b]/10 flex items-center gap-2 text-xs font-bold text-[#c41e3a]">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>กำลังดำเนินการ</span>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
