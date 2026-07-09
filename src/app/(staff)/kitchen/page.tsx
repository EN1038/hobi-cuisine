'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Bell, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { getActiveOrders, updateOrderStatus } from '@/db/operations';
import { broadcastService } from '@/services/broadcastService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, getOrderTypeInfo, minutesElapsed } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

type KDSColumn = {
  id: OrderStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
};

const columns: KDSColumn[] = [
  { id: 'confirmed', title: 'ออเดอร์ใหม่', icon: Bell, color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  { id: 'preparing', title: 'กำลังปรุง', icon: ChefHat, color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  { id: 'ready', title: 'อาหารพร้อมเสิร์ฟ', icon: CheckCircle2, color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
];

export default function KitchenDisplaySystem() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio ref for notification
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    

    const activeOrders = await getActiveOrders();
    setOrders(activeOrders);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    
    // Listen for new orders
    const unsubscribeNew = broadcastService.on('NEW_ORDER', (event) => {
      loadOrders();
      audioRef.current?.play().catch(e => console.log('Audio play blocked:', e));
    });
    
    // Listen for status updates from POS
    const unsubscribeUpdate = broadcastService.on('ORDER_STATUS_UPDATE', (event) => {
      // We could also check branchId here if POS sends it
      loadOrders();
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
    };
  }, []);

  const handleStatusChange = async (orderId: number, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    await updateOrderStatus(orderId, newStatus);
    broadcastService.send('ORDER_STATUS_UPDATE', { orderId, status: newStatus });
    
    if (newStatus === 'completed') {
      // Remove from KDS if completed
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }, 500);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#f6e5cc]">
      <div className="w-8 h-8 border-2 border-[#88042b] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) {
    return <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f6e5cc] text-[#88042b]">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold mb-2">กรุณาเข้าสู่ระบบก่อน</h2>
      <p className="text-gray-600 mb-6 font-medium">คุณต้องเข้าสู่ระบบด้วยบัญชีห้องครัว</p>
      <a href="/" className="px-6 py-2 bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-[#f6e5cc] font-bold rounded-lg shadow-md hover:scale-105 transition-transform">กลับสู่หน้าแรก</a>
    </div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f6e5cc]">
      {/* KDS Header */}
      <header className="h-14 shrink-0 border-b border-[#88042b]/10 flex items-center justify-between px-6 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <ChefHat className="w-5 h-5 text-[#88042b]" />
          <h1 className="font-bold text-lg text-[#88042b]">Kitchen Display System (KDS)</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#88042b] bg-gray-100 px-3 py-1.5 rounded-full shadow-sm">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleTimeString('th-TH')}
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(column => {
            const columnOrders = orders.filter(o => o.status === column.id);
            const Icon = column.icon;

            return (
              <div key={column.id} className="w-80 md:w-96 flex flex-col h-full bg-white rounded-2xl border border-[#88042b]/10 shadow-md overflow-hidden shrink-0">
                
                {/* Column Header */}
                <div className={`p-4 border-b flex items-center justify-between ${column.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${column.color}`} />
                    <h2 className={`font-bold ${column.color}`}>{column.title}</h2>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold border border-gray-200 text-gray-700">
                    {columnOrders.length}
                  </div>
                </div>

                {/* Tickets Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gray-50/50">
                  <AnimatePresence>
                    {columnOrders.map(order => {
                      const typeInfo = getOrderTypeInfo(order.orderType);
                      const mins = minutesElapsed(order.createdAt);
                      const isUrgent = mins >= 15 && order.status !== 'ready';
                      const isWarning = mins >= 10 && !isUrgent && order.status !== 'ready';

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          key={order.id}
                          className={`bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow ${
                            isUrgent ? 'border-red-300 shadow-red-200' :
                            isWarning ? 'border-orange-300 shadow-orange-100' :
                            'border-gray-200'
                          }`}
                        >
                          {/* Ticket Header */}
                          <div className={`px-4 py-2 border-b flex justify-between items-center ${
                            isUrgent ? 'bg-red-600 border-red-700 text-white' :
                            isWarning ? 'bg-orange-50 border-orange-200 text-orange-800' :
                            'bg-gray-50 border-gray-100 text-gray-700'
                          }`}>
                            <div className={`font-mono font-bold text-lg drop-shadow-sm ${isUrgent ? 'text-white' : 'text-[#c41e3a]'}`}>
                              {order.orderNumber}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                              {isUrgent && <AlertTriangle className="w-4 h-4 text-white" />}
                              <span className={isUrgent ? 'text-white' : isWarning ? 'text-orange-600' : 'text-gray-500'}>
                                {mins} นาที
                              </span>
                            </div>
                          </div>

                          {/* Order Info */}
                          <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                              {typeInfo.icon} {typeInfo.label}
                            </div>
                            {order.tableNumber && (
                              <div className="px-2 py-0.5 bg-[#88042b]/10 text-[#88042b] rounded font-bold text-xs">
                                โต๊ะ {order.tableNumber}
                              </div>
                            )}
                          </div>

                          {/* Items List */}
                          <div className="p-4 bg-white">
                            <ul className="space-y-3">
                              {order.items.map((item, i) => (
                                <li key={i} className="flex gap-3">
                                  <div className="w-6 h-6 shrink-0 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-sm text-[#88042b] shadow-sm">
                                    {item.quantity}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#88042b] text-base leading-snug">{item.itemName}</div>
                                    
                                    {item.selectedOptions.length > 0 && (
                                      <div className="text-sm text-gray-600 mt-0.5 font-medium leading-snug">
                                        {item.selectedOptions.map(o => o.choice).join(', ')}
                                      </div>
                                    )}
                                    
                                    {item.selectedAddons.length > 0 && (
                                      <div className="text-sm text-gray-600 font-medium leading-snug">
                                        + {item.selectedAddons.map(a => a.name).join(', ')}
                                      </div>
                                    )}
                                    
                                    {item.specialInstructions && (
                                      <div className="text-sm text-red-700 mt-1 font-bold bg-red-50 border border-red-100 px-2 py-1 rounded inline-block shadow-sm">
                                        ⚠️ {item.specialInstructions}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                            
                            {order.notes && (
                              <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 italic font-medium shadow-inner">
                                หมายเหตุถึงร้าน: {order.notes}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(order.id!, 'confirmed', 'preparing')}
                                className="flex-1 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Play className="w-4 h-4 fill-current" /> เริ่มทำอาหาร
                              </button>
                            )}
                            
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => handleStatusChange(order.id!, 'preparing', 'ready')}
                                className="flex-1 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                              >
                                <CheckCircle2 className="w-4 h-4" /> อาหารพร้อมเสิร์ฟ
                              </button>
                            )}
                            
                            {order.status === 'ready' && (
                              <button
                                onClick={() => handleStatusChange(order.id!, 'ready', 'completed')}
                                className="flex-1 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                              >
                                ส่งมอบแล้ว / เสิร์ฟแล้ว
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {columnOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                      <Icon className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm font-medium">ไม่มีออเดอร์</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
