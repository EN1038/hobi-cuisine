'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CalendarCheck, Phone, Clock, User, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { getAllTables, clearStaleReservations, updateTable } from '@/db/operations';
import type { DiningTable } from '@/types';

export default function BookTablePage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState<{tableNumber: string, time: string} | null>(null);

  useEffect(() => {
    loadTables();
    // Setting up polling every 30s to refresh table status
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadTables() {
    setLoading(true);
    await clearStaleReservations();
    const data = await getAllTables();
    setTables(data);
    setLoading(false);
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedTable.id) return;
    if (!phone || phone.length < 9) {
      alert('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง');
      return;
    }

    const now = new Date().toISOString();
    await updateTable(selectedTable.id, {
      status: 'reserved',
      reservedPhone: phone,
      reservedAt: now,
    });

    const timeStr = new Date(now).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    setSuccess({ tableNumber: selectedTable.tableNumber, time: timeStr });
    setSelectedTable(null);
    setPhone('');
    loadTables();
  };

  return (
    <div className="min-h-screen bg-[#f6e5cc] pt-24 pb-20 px-4 flex flex-col text-gray-800">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#88042b] font-bold hover:underline mb-4">
          <ChevronLeft className="w-5 h-5" /> กลับหน้าหลัก
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-[#88042b] flex items-center gap-3">
          <CalendarCheck className="w-8 h-8" />
          จองโต๊ะล่วงหน้า
        </h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          เลือกโต๊ะที่ว่างและกรอกเบอร์โทรศัพท์ ระบบจะทำการจองโต๊ะและเก็บรักษาไว้ให้คุณ 30 นาที
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full flex-1">
        
        {loading && tables.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#88042b] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#88042b]/10">
            
            {/* Status Legend */}
            <div className="flex flex-wrap gap-4 justify-center mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border border-green-500"></div>
                <span className="text-sm font-bold text-gray-600">ว่าง (จองได้)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-100 border border-orange-500"></div>
                <span className="text-sm font-bold text-gray-600">จองแล้ว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 border border-red-500"></div>
                <span className="text-sm font-bold text-gray-600">ไม่ว่าง</span>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map(table => {
                let bgColor = 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer';
                let textColor = 'text-green-700';
                
                if (table.status === 'occupied') {
                  bgColor = 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed';
                  textColor = 'text-red-700';
                } else if (table.status === 'reserved') {
                  bgColor = 'bg-orange-50 border-orange-200 opacity-80 cursor-not-allowed';
                  textColor = 'text-orange-700';
                }

                return (
                  <motion.div
                    key={table.id}
                    whileHover={table.status === 'available' ? { scale: 1.05 } : {}}
                    whileTap={table.status === 'available' ? { scale: 0.95 } : {}}
                    onClick={() => table.status === 'available' && setSelectedTable(table)}
                    className={`border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors h-32 ${bgColor}`}
                  >
                    <div className={`text-2xl font-black mb-1 ${textColor}`}>{table.tableNumber}</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 opacity-80">
                      <User className="w-3 h-3" /> {table.capacity} ท่าน
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {tables.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500 font-bold">
                ยังไม่มีการตั้งค่าโต๊ะในระบบ
              </div>
            )}
          </div>
        )}

      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-[#88042b] p-6 text-center relative">
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-[#f6e5cc] rounded-full mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-black text-[#88042b]">{selectedTable.tableNumber}</span>
                </div>
                <h3 className="text-xl font-bold text-[#f6e5cc]">ยืนยันการจองโต๊ะ</h3>
                <p className="text-white/80 text-sm mt-1">โต๊ะสำหรับ {selectedTable.capacity} ท่าน</p>
              </div>
              
              <form onSubmit={handleBook} className="p-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#88042b]" />
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-[#88042b] focus:ring-4 focus:ring-[#88042b]/10 transition-all mb-6"
                />
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#88042b] text-[#f6e5cc] font-bold rounded-xl hover:bg-[#6a0321] shadow-lg shadow-red-900/20 transition-all active:scale-95"
                  >
                    ยืนยันจองโต๊ะ
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">จองโต๊ะสำเร็จ!</h3>
              <p className="text-gray-500 mb-6">
                ระบบได้ทำการจองโต๊ะ <span className="font-bold text-[#88042b]">{success.tableNumber}</span> ให้คุณเรียบร้อยแล้ว
              </p>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
                <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-orange-800 mb-1">กรุณามาถึงก่อนเวลา {
                    new Date(new Date().getTime() + 30 * 60000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                  } น.</div>
                  <div className="text-xs text-orange-600">หากเกิน 30 นาที ระบบจะทำการยกเลิกการจองอัตโนมัติ</div>
                </div>
              </div>

              <button 
                onClick={() => setSuccess(null)}
                className="w-full py-3 bg-[#88042b] text-[#f6e5cc] font-bold rounded-xl hover:bg-[#6a0321] transition-all"
              >
                ตกลง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
