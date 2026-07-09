'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, Award,
  Store, ChevronDown, Package, Edit, Trash2, Plus, X, Image as ImageIcon
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { db } from '@/db/database';
import { 
  getTopMenuItems,
  getAllCategories, addCategory, updateCategory, deleteCategory,
  getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
  getAllTables, addTable, updateTable, deleteTable,
  clearStaleReservations
} from '@/db/operations';
import { formatPrice } from '@/lib/utils';
import type { User, Order, MenuCategory, MenuItem, DiningTable } from '@/types';

type Tab = 'overview' | 'menu' | 'tables';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [topItems, setTopItems] = useState<{name: string, count: number, revenue: number}[]>([]);
  const [topCustomers, setTopCustomers] = useState<User[]>([]);

  // Modals

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<MenuCategory | null>(null);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuItem | null>(null);

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<DiningTable | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    
    if (activeTab === 'overview') {
      let orders = await db.orders.where('status').notEqual('cancelled').toArray();
      const rev = orders.reduce((sum, o) => sum + o.total, 0);
      setTotalRevenue(rev);
      setTotalOrders(orders.length);
      setAvgOrderValue(orders.length > 0 ? rev / orders.length : 0);

      const topMenu = await getTopMenuItems(5);
      setTopItems(topMenu);

      const users = await db.users.where('role').equals('customer').toArray();
      const sortedUsers = users.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 10);
      setTopCustomers(sortedUsers);
    } else if (activeTab === 'menu') {
      setCategories(await getAllCategories());
      setMenuItems(await getAllMenuItems());
    } else if (activeTab === 'tables') {
      await clearStaleReservations();
      setTables(await getAllTables());
    }
    setLoading(false);
  }

  // --- Category CRUD ---
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const icon = fd.get('icon') as string;
    const sortOrder = Number(fd.get('sortOrder'));
    const isActive = fd.get('isActive') === 'on';

    if (editCategory?.id) {
      await updateCategory(editCategory.id, { name, icon, sortOrder, isActive });
    } else {
      await addCategory({ name, icon, sortOrder, isActive });
    }
    setShowCategoryModal(false);
    loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('ลบหมวดหมู่นี้?')) {
      await deleteCategory(id);
      loadData();
    }
  };

  // --- Menu Item CRUD ---
  const handleSaveMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const itemData: Partial<MenuItem> = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      price: Number(fd.get('price')),
      categoryId: Number(fd.get('categoryId')),
      imageUrl: fd.get('imageUrl') as string || undefined,
      isAvailable: fd.get('isAvailable') === 'on',
      isPopular: fd.get('isPopular') === 'on',
      preparationTime: 15,
      options: editMenu?.options || [],
      addons: editMenu?.addons || [],
    };

    if (editMenu?.id) {
      await updateMenuItem(editMenu.id, itemData);
    } else {
      itemData.createdAt = new Date().toISOString();
      await addMenuItem(itemData as Omit<MenuItem, 'id'>);
    }
    setShowMenuModal(false);
    loadData();
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (confirm('ลบเมนูนี้?')) {
      await deleteMenuItem(id);
      loadData();
    }
  };

  // --- Tables CRUD ---
  const handleSaveTable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tableData: Partial<DiningTable> = {
      tableNumber: fd.get('tableNumber') as string,
      capacity: Number(fd.get('capacity')),
      status: fd.get('status') as 'available' | 'occupied',
    };

    tableData.createdAt = new Date().toISOString();
    await addTable(tableData as Omit<DiningTable, 'id'>);
    setShowTableModal(false);
    loadData();
  };

  const handleDeleteTable = async (id: number) => {
    if (confirm('ลบโต๊ะนี้?')) {
      await deleteTable(id);
      loadData();
    }
  };

  const handleCheckInReservedTable = async (id: number) => {
    await updateTable(id, { status: 'occupied', reservedPhone: undefined, reservedAt: undefined });
    loadData();
  };

  const handleCancelReservation = async (id: number) => {
    if (confirm('ยกเลิกการจองนี้?')) {
      await updateTable(id, { status: 'available', reservedPhone: undefined, reservedAt: undefined });
      loadData();
    }
  };

  if (loading && totalRevenue === 0) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f6e5cc]">
      <div className="w-8 h-8 border-2 border-[#88042b] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="flex-1 min-h-screen bg-[#f6e5cc] pb-10 text-gray-800">
      
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-[#88042b]/10 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#88042b]" />
          <h1 className="font-bold text-lg text-[#88042b]">Admin Dashboard</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner border border-gray-200">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'overview' ? 'bg-[#88042b] text-white font-bold shadow-sm' : 'text-gray-600 font-medium hover:text-gray-900'}`}
          >ภาพรวม</button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'menu' ? 'bg-[#88042b] text-white font-bold shadow-sm' : 'text-gray-600 font-medium hover:text-gray-900'}`}
          >เมนูอาหาร</button>
          <button 
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'tables' ? 'bg-[#88042b] text-white font-bold shadow-sm' : 'text-gray-600 font-medium hover:text-gray-900'}`}
          >จัดการโต๊ะ</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* ============================== */}
        {/* TAB 1: OVERVIEW                */}
        {/* ============================== */}
        {activeTab === 'overview' && (
          <>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center shadow-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200">+12.5%</span>
                </div>
                <div className="text-gray-500 text-sm font-bold mb-1">ยอดขายรวม (Revenue)</div>
                <div className="text-3xl font-black text-gray-800">{formatPrice(totalRevenue)}</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm font-bold mb-1">จำนวนออเดอร์ (Orders)</div>
                <div className="text-3xl font-black text-gray-800">{totalOrders} <span className="text-sm font-bold text-gray-400">บิล</span></div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm font-bold mb-1">ยอดใช้จ่ายเฉลี่ยต่อบิล (AOV)</div>
                <div className="text-3xl font-black text-gray-800">{formatPrice(avgOrderValue)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Menu Items */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-[#88042b]" />
                  <h2 className="font-bold text-lg text-[#88042b]">เมนูยอดนิยม (Best Sellers)</h2>
                </div>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200' : index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800' : index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{item.name}</div>
                        <div className="text-xs font-medium text-gray-500">{item.count} จาน</div>
                      </div>
                      <div className="font-black text-[#88042b] text-sm">{formatPrice(item.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#88042b]" />
                    <h2 className="font-bold text-lg text-[#88042b]">ลูกค้า Top Spenders</h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">ลูกค้า</th>
                        <th className="px-4 py-3 text-right">จำนวนครั้ง</th>
                        <th className="px-4 py-3 rounded-tr-lg text-right">ยอดใช้จ่ายรวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((customer, idx) => (
                        <tr key={customer.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-800">{customer.name}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-600">{customer.totalOrders || 0}</td>
                          <td className="px-4 py-3 text-right font-black text-[#88042b]">{formatPrice(customer.totalSpent || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}



        {/* ============================== */}
        {/* TAB 3: MENU                    */}
        {/* ============================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl flex items-center gap-2 text-[#88042b]">หมวดหมู่ <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded shadow-inner">Category</span></h2>
                <button 
                  onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}
                  className="bg-gray-100 hover:bg-gray-200 text-[#88042b] px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <div key={c.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${c.isActive ? 'bg-white border-gray-300 text-gray-800' : 'bg-red-50 border-red-200 text-red-800 opacity-70'}`}>
                    <span>{c.icon}</span>
                    <span className="text-sm font-bold">{c.name}</span>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button onClick={() => { setEditCategory(c); setShowCategoryModal(true); }} className="text-blue-600 hover:text-blue-800"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteCategory(c.id!)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl text-[#88042b]">รายการอาหาร</h2>
                <button 
                  onClick={() => { setEditMenu(null); setShowMenuModal(true); }}
                  className="bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4" /> เพิ่มเมนูใหม่
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  return (
                    <div key={item.id} className={`flex gap-3 p-3 rounded-xl border transition-shadow hover:shadow-md ${item.isAvailable ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 grayscale opacity-80'}`}>
                      <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center text-3xl shrink-0 overflow-hidden relative shadow-inner">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : cat?.icon}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</div>
                        <div className="text-xs font-medium text-gray-500 mb-1">{cat?.name}</div>
                        <div className="font-black text-[#88042b] text-sm">{formatPrice(item.price)}</div>
                      </div>
                      <div className="flex flex-col gap-1 justify-center shrink-0">
                        <button onClick={() => { setEditMenu(item); setShowMenuModal(true); }} className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-blue-600 rounded shadow-sm transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteMenuItem(item.id!)} className="p-1.5 bg-white border border-gray-200 hover:bg-red-50 text-red-500 rounded shadow-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* TAB 3: TABLES                  */}
        {/* ============================== */}
        {activeTab === 'tables' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-[#88042b]">จัดการโต๊ะในร้าน</h2>
              <button 
                onClick={() => setShowTableModal(true)}
                className="bg-[#88042b] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md hover:bg-[#c41e3a]"
              >
                <Plus className="w-4 h-4" /> เพิ่มโต๊ะ
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map(table => {
                const isAvailable = table.status === 'available';
                const isReserved = table.status === 'reserved';
                return (
                  <div key={table.id} className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-colors relative ${isAvailable ? 'bg-green-50 border-green-200 hover:border-green-300 text-green-800' : isReserved ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="text-2xl font-black mb-1">{table.tableNumber}</div>
                    <div className="text-xs font-bold opacity-70 mb-3">{table.capacity} ท่าน</div>
                    
                    {isReserved && table.reservedPhone && (
                      <div className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded w-full text-center mb-3 truncate">
                        เบอร์: {table.reservedPhone}
                      </div>
                    )}

                    <div className="flex flex-col w-full gap-2 mt-auto">
                      {isReserved ? (
                        <>
                          <button onClick={() => handleCheckInReservedTable(table.id!)} className="w-full py-1.5 bg-orange-200 hover:bg-orange-300 text-orange-900 rounded font-bold text-xs transition-colors">ลูกค้านั่งแล้ว</button>
                          <button onClick={() => handleCancelReservation(table.id!)} className="w-full py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold text-xs transition-colors">ยกเลิกจอง</button>
                        </>
                      ) : (
                        <button onClick={() => setShowQRModal(table)} className="w-full py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-bold text-xs transition-colors shadow-sm">ดู QR Code</button>
                      )}
                      <button onClick={() => handleDeleteTable(table.id!)} className="w-full py-1.5 text-red-500 hover:bg-red-50 rounded font-bold text-xs transition-colors">ลบโต๊ะ</button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {tables.length === 0 && (
              <div className="text-center py-10 text-gray-500 font-bold">ยังไม่มีโต๊ะในระบบ กรุณาเพิ่มโต๊ะ</div>
            )}
          </div>
        )}

      </div>

      {/* ============================== */}
      {/* MODALS                         */}
      {/* ============================== */}



      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-gray-200 shadow-2xl p-5">
            <h2 className="font-bold text-xl mb-4 text-[#88042b]">{editCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-16">
                  <label className="text-xs font-bold text-gray-500 block mb-1">ไอคอน</label>
                  <input name="icon" defaultValue={editCategory?.icon} required placeholder="🍲" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-lg text-center focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner text-gray-800" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">ชื่อหมวดหมู่</label>
                  <input name="name" defaultValue={editCategory?.name} required className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">ลำดับการแสดงผล (ตัวเลขน้อยขึ้นก่อน)</label>
                <input type="number" name="sortOrder" defaultValue={editCategory?.sortOrder || categories.length + 1} required className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-200">
                <input type="checkbox" name="isActive" defaultChecked={editCategory ? editCategory.isActive : true} className="w-4 h-4 accent-[#88042b]" />
                <span className="text-sm font-bold text-gray-700">เปิดใช้งาน</span>
              </label>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#88042b] text-white font-bold rounded-lg hover:bg-[#c41e3a] shadow-md transition-colors">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl p-5 max-h-[90vh] flex flex-col">
            <h2 className="font-bold text-xl mb-4 shrink-0 text-[#88042b]">{editMenu ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h2>
            <form onSubmit={handleSaveMenuItem} className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">ชื่อเมนู</label>
                <input name="name" defaultValue={editMenu?.name} required className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">รายละเอียด (Description)</label>
                <textarea name="description" defaultValue={editMenu?.description} required className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none h-16 resize-none shadow-inner"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">ราคา (บาท)</label>
                  <input type="number" name="price" defaultValue={editMenu?.price} required min="0" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">หมวดหมู่</label>
                  <select name="categoryId" defaultValue={editMenu?.categoryId || categories[0]?.id} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Image URL (ถ้ามี)</label>
                <input name="imageUrl" defaultValue={editMenu?.imageUrl} placeholder="https://..." className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 outline-none shadow-inner" />
                <p className="text-[10px] font-bold text-gray-400 mt-1">หากไม่ใส่ ระบบจะใช้สีพื้นหลังและไอคอนหมวดหมู่แทน</p>
              </div>



              <div className="border-t border-gray-200 pt-4 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex-1">
                  <input type="checkbox" name="isAvailable" defaultChecked={editMenu ? editMenu.isAvailable : true} className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-bold text-gray-700">พร้อมขาย (Available)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex-1">
                  <input type="checkbox" name="isPopular" defaultChecked={editMenu ? editMenu.isPopular : false} className="w-4 h-4 accent-red-600" />
                  <span className="text-sm font-bold text-red-600">🔥 เมนูยอดนิยม (Popular)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 shrink-0 border-t border-gray-200 mt-4">
                <button type="button" onClick={() => setShowMenuModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#88042b] text-white font-bold rounded-lg hover:bg-[#c41e3a] shadow-md transition-colors">บันทึกเมนู</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Add Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#88042b]">เพิ่มโต๊ะใหม่</h3>
              <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTable} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขโต๊ะ (เช่น T01)</label>
                <input name="tableNumber" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความจุ (คน)</label>
                <input type="number" name="capacity" defaultValue={4} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select name="status" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]">
                  <option value="available">ว่าง</option>
                  <option value="occupied">ไม่ว่าง</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTableModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#88042b] text-white rounded-lg text-sm font-bold">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8">
            <h3 className="font-bold text-2xl text-[#88042b] mb-2">โต๊ะ {showQRModal.tableNumber}</h3>
            <p className="text-sm text-gray-500 mb-6">สแกนเพื่อสั่งอาหาร</p>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <QRCodeCanvas 
                value={`${window.location.origin}/menu?table=${showQRModal.tableNumber}`} 
                size={200}
                level="H"
                fgColor="#88042b"
                imageSettings={{
                  src: "/images/logo-section-2.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="w-full flex gap-2">
              <button 
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const url = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = `QR-Table-${showQRModal.tableNumber}.png`;
                    link.href = url;
                    link.click();
                  }
                }}
                className="flex-1 py-2 border border-[#88042b] text-[#88042b] hover:bg-[#f6e5cc] rounded-lg font-bold text-sm transition-colors"
              >
                บันทึกภาพ
              </button>
              <button 
                onClick={() => setShowQRModal(null)} 
                className="flex-1 py-2 bg-[#88042b] text-white hover:bg-[#a00535] rounded-lg font-bold text-sm transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
