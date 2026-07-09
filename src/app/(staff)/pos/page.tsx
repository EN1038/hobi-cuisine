'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Minus, X, CheckCircle2, User as UserIcon, 
  CreditCard, Banknote, QrCode, Receipt, Store, ShoppingBag
} from 'lucide-react';
import { getAllCategories, getAvailableMenuItems, getUserByPhone } from '@/db/operations';
import { createOrder } from '@/services/orderService';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, generateId } from '@/lib/utils';
import type { MenuCategory, MenuItem, CartItem, OrderType, PaymentMethod, User } from '@/types';

export default function POSPage() {
  const { user } = useAuthStore();
  
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  
  // Customer CRM State
  const [customerPhone, setCustomerPhone] = useState('');
  const [linkedCustomer, setLinkedCustomer] = useState<User | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Modal States
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemOptions, setItemOptions] = useState<Record<string, { choice: string; priceAdd: number }>>({});
  const [itemAddons, setItemAddons] = useState<Record<string, { name: string; price: number }>>({});
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  // Checkout State
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      const [cats, items] = await Promise.all([
        getAllCategories(),
        getAvailableMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleCustomerSearch = async () => {
    if (!customerPhone.trim()) return;
    setIsSearchingCustomer(true);
    const customer = await getUserByPhone(customerPhone.trim());
    if (customer) {
      setLinkedCustomer(customer);
    } else {
      alert('ไม่พบข้อมูลลูกค้าจากเบอร์โทรศัพท์นี้');
      setLinkedCustomer(null);
    }
    setIsSearchingCustomer(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // --- Cart Operations ---
  const handleItemClick = (item: MenuItem) => {
    if ((item.options && item.options.length > 0) || (item.addons && item.addons.length > 0)) {
      // Open modal if has options
      setSelectedItem(item);
      setItemQty(1);
      setItemNotes('');
      
      const initialOptions: Record<string, { choice: string; priceAdd: number }> = {};
      item.options?.forEach(opt => {
        if (opt.choices.length > 0) {
          initialOptions[opt.name] = { 
            choice: opt.choices[0].label, 
            priceAdd: opt.choices[0].priceAdd 
          };
        }
      });
      setItemOptions(initialOptions);
      setItemAddons({});
    } else {
      // Add directly
      addToCart(item, [], [], 1, '');
    }
  };

  const addToCart = (
    item: MenuItem, 
    options: {optionName: string, choice: string, priceAdd: number}[], 
    addons: {name: string, price: number}[], 
    qty: number, 
    notes: string
  ) => {
    let basePrice = item.price;
    options.forEach(o => basePrice += o.priceAdd);
    addons.forEach(a => basePrice += a.price);

    const newItem: CartItem = {
      id: generateId(),
      menuItemId: item.id!,
      name: item.name,
      price: item.price,
      quantity: qty,
      selectedOptions: options,
      selectedAddons: addons,
      specialInstructions: notes,
      imageUrl: item.imageUrl,
      totalPrice: basePrice * qty
    };

    setCart(prev => [...prev, newItem]);
    setSelectedItem(null);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        const unitPrice = item.totalPrice / item.quantity;
        return { ...item, quantity: newQty, totalPrice: unitPrice * newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const vat = Math.round(subtotal * 0.07);
  const total = subtotal + vat;

  // --- Checkout ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (orderType === 'dine-in' && !tableNumber) {
      alert('กรุณาระบุหมายเลขโต๊ะ');
      return;
    }
    
    setIsCheckingOut(true);

    try {
      // Either use linked customer or the cashier's ID as dummy
      const targetUserId = linkedCustomer ? linkedCustomer.id! : user!.id!;
      const targetUserName = linkedCustomer ? linkedCustomer.name : 'Walk-in Customer';

      const order = await createOrder({
        userId: targetUserId,
        userName: targetUserName,
        items: cart,
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        deliveryFee: 0,
        subtotal,
        discount: 0,
        pointsRedeemed: 0,
        pointsDiscount: 0,
        vat,
        total,
        paymentMethod,
        notes: `POS Order by ${user!.name}`,
      });

      setLastOrderNumber(order.orderNumber);
      setShowSuccess(true);
      
      // Reset
      setCart([]);
      setLinkedCustomer(null);
      setCustomerPhone('');
      setTableNumber('');
      setOrderType('dine-in');
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการสร้างออเดอร์');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f6e5cc]">
      <div className="w-8 h-8 border-2 border-[#88042b] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) {
    return <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#f6e5cc] text-[#88042b]">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-bold mb-2">กรุณาเข้าสู่ระบบก่อน</h2>
      <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบด้วยบัญชีพนักงาน</p>
      <a href="/" className="px-6 py-2 bg-gradient-to-r from-[#88042b] to-[#c41e3a] text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform">กลับสู่หน้าแรก</a>
    </div>;
  }

  return (
    <div className="flex h-full w-full bg-[#f6e5cc] overflow-hidden text-gray-800">
      
      {/* Left Pane - Menu Grid */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-gray-200 relative">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#88042b]" />
            <h1 className="font-bold text-lg text-[#88042b]">HOBI POS</h1>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-transparent rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:bg-white focus:border-[#88042b]/50 focus:ring-1 focus:ring-[#88042b]/50 transition-all shadow-inner"
            />
          </div>
        </header>

        {/* Categories */}
        <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide border-b border-gray-200 shrink-0 bg-white shadow-sm z-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors shadow-sm ${
              activeCategory === 'all' ? 'bg-[#88042b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id!)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm ${
                activeCategory === cat.id ? 'bg-[#88042b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-gray-50/50">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white border border-gray-200 hover:border-[#88042b]/50 shadow-sm hover:shadow-md rounded-xl p-3 text-left transition-all flex flex-col group active:scale-95"
              >
                <div className="w-full aspect-square bg-gray-50 border border-gray-100 rounded-lg mb-2 flex items-center justify-center text-4xl shadow-inner group-hover:bg-red-50 transition-colors overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    categories.find(c => c.id === item.categoryId)?.icon || '🍽️'
                  )}
                </div>
                <div className="font-bold text-sm leading-tight mb-1 group-hover:text-[#c41e3a] text-gray-800 line-clamp-2 flex-1 transition-colors">
                  {item.name}
                </div>
                <div className="font-black text-[#88042b] text-sm">{formatPrice(item.price)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Order Ticket */}
      <div className="w-96 shrink-0 flex flex-col bg-white">
        {/* Customer Lookup CRM */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer & Order</div>
          
          {linkedCustomer ? (
            <div className="flex items-center justify-between p-3 bg-[#88042b]/5 border border-[#88042b]/20 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#88042b]/10 flex items-center justify-center text-[#88042b]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#88042b]">{linkedCustomer.name}</div>
                  <div className="text-xs font-medium text-gray-600">{linkedCustomer.phone} | {linkedCustomer.loyaltyPoints} pt</div>
                </div>
              </div>
              <button onClick={() => setLinkedCustomer(null)} className="p-1 hover:bg-[#88042b]/10 rounded text-gray-500 hover:text-[#c41e3a] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="เบอร์โทรลูกค้า (สะสมแต้ม)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]/50 focus:ring-1 focus:ring-[#88042b]/50 shadow-inner"
              />
              <button 
                onClick={handleCustomerSearch}
                disabled={isSearchingCustomer || !customerPhone}
                className="px-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold text-gray-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                ค้นหา
              </button>
            </div>
          )}

          {/* Order Type Tabs */}
          <div className="flex gap-2 mt-3 p-1 bg-gray-200 rounded-lg shadow-inner">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
                orderType === 'dine-in' ? 'bg-white text-[#88042b] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ทานที่ร้าน
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
                orderType === 'takeaway' ? 'bg-white text-[#88042b] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              สั่งกลับบ้าน
            </button>
          </div>

          {orderType === 'dine-in' && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="หมายเลขโต๊ะ *"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]/50 focus:ring-1 focus:ring-[#88042b]/50 text-center font-bold shadow-inner text-[#88042b]"
              />
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80">
              <Receipt className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">ไม่มีรายการอาหาร</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-sm text-gray-800">{item.name}</div>
                      {(item.selectedOptions.length > 0 || item.selectedAddons.length > 0 || item.specialInstructions) && (
                        <div className="text-xs font-medium text-gray-500 mt-0.5 leading-tight">
                          {item.selectedOptions.map(o => o.choice).join(', ')}
                          {item.selectedAddons.length > 0 && ` + ${item.selectedAddons.map(a => a.name).join(', ')}`}
                          {item.specialInstructions && ` [${item.specialInstructions}]`}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-[#88042b] text-sm">{formatPrice(item.totalPrice)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-md border border-gray-200 shadow-inner">
                      <button 
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-8 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="w-8 text-center text-sm font-bold text-[#88042b]">{item.quantity}</div>
                      <button 
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-8 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
                    >
                      ลบ
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Totals & Pay */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5 text-sm mb-4">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>ยอดรวม</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>VAT 7%</span>
              <span>{formatPrice(vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200 mt-1">
              <span>ยอดสุทธิ</span>
              <span className="text-[#c41e3a]">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all shadow-sm ${
                paymentMethod === 'cash' ? 'bg-green-100 text-green-700 border-green-300 shadow-inner' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Banknote className="w-4 h-4" /> เงินสด
            </button>
            <button
              onClick={() => setPaymentMethod('promptpay')}
              className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-all shadow-sm ${
                paymentMethod === 'promptpay' ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-inner' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <QrCode className="w-4 h-4" /> พร้อมเพย์
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut || (orderType === 'dine-in' && !tableNumber)}
            className="w-full py-3.5 bg-gradient-to-r from-[#88042b] to-[#c41e3a] disabled:opacity-50 disabled:grayscale text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-transform shadow-md active:scale-[0.98] hover:scale-[1.02]"
          >
            {isCheckingOut ? (
               <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>ชำระเงิน {formatPrice(total)}</>
            )}
          </button>
        </div>
      </div>

      {/* Options Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-lg text-[#88042b]">{selectedItem.name}</h2>
                <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto space-y-4">
                {selectedItem.options?.map(opt => (
                  <div key={opt.name}>
                    <h3 className="text-sm font-bold mb-2 text-gray-800">{opt.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {opt.choices.map(choice => (
                        <button
                          key={choice.label}
                          onClick={() => setItemOptions(prev => ({...prev, [opt.name]: {choice: choice.label, priceAdd: choice.priceAdd}}))}
                          className={`p-2 text-sm rounded-lg border transition-all text-left flex justify-between items-center shadow-sm ${
                            itemOptions[opt.name]?.choice === choice.label ? 'bg-[#88042b]/10 border-[#88042b]/30 text-[#88042b] font-bold shadow-inner' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{choice.label}</span>
                          {choice.priceAdd > 0 && <span className="text-xs opacity-70">+{choice.priceAdd}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {selectedItem.addons && selectedItem.addons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2 text-gray-800">ท็อปปิ้ง</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.addons.map(addon => {
                        const isSelected = !!itemAddons[addon.name];
                        return (
                          <button
                            key={addon.name}
                            onClick={() => setItemAddons(prev => {
                              const next = {...prev};
                              if (isSelected) delete next[addon.name];
                              else next[addon.name] = { name: addon.name, price: addon.price };
                              return next;
                            })}
                            className={`p-2 text-sm rounded-lg border transition-all text-left flex justify-between items-center shadow-sm ${
                              isSelected ? 'bg-[#88042b]/10 border-[#88042b]/30 text-[#88042b] font-bold shadow-inner' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{addon.name}</span>
                            <span className="text-xs opacity-70">+{addon.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold mb-2 text-gray-800">หมายเหตุ</h3>
                  <input
                    type="text"
                    value={itemNotes}
                    onChange={e => setItemNotes(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#88042b]/50 focus:bg-white focus:ring-1 focus:ring-[#88042b]/50 shadow-inner"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button onClick={() => setItemQty(Math.max(1, itemQty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-lg text-gray-600 transition-colors">-</button>
                  <div className="w-10 text-center font-bold text-[#88042b]">{itemQty}</div>
                  <button onClick={() => setItemQty(itemQty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-lg text-gray-600 transition-colors">+</button>
                </div>
                <button
                  onClick={() => addToCart(
                    selectedItem, 
                    Object.entries(itemOptions).map(([optionName, data]) => ({optionName, choice: data.choice, priceAdd: data.priceAdd})),
                    Object.values(itemAddons),
                    itemQty,
                    itemNotes
                  )}
                  className="flex-1 bg-gradient-to-r from-[#88042b] to-[#c41e3a] hover:from-[#c41e3a] hover:to-[#c41e3a] text-white font-bold rounded-lg flex justify-center items-center shadow-md transition-all hover:scale-[1.02]"
                >
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Bill Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-black w-full max-w-sm rounded-lg p-6 flex flex-col shadow-2xl relative"
            >
              {/* Receipt Header */}
              <div className="text-center mb-6">
                <div className="text-2xl font-bold mb-1 text-[#88042b]">HOBI Cuisine</div>
                <div className="text-sm text-gray-600 font-medium">สาขาเดียว</div>
                <div className="text-xs text-gray-500 mt-2 font-bold tracking-wider">ใบเสร็จรับเงิน / RECEIPT</div>
              </div>
              
              <div className="flex justify-between text-sm mb-4 text-gray-600 border-b border-gray-200 pb-4 border-dashed">
                <div>
                  <div className="font-medium">ออเดอร์: <span className="font-bold text-black">{lastOrderNumber}</span></div>
                  <div className="font-medium">เวลา: {new Date().toLocaleTimeString('th-TH')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">คิว: <span className="font-bold text-[#c41e3a] text-lg">{lastOrderNumber.slice(-3)}</span></div>
                  <div className="font-medium">โต๊ะ: {tableNumber || '-'}</div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-3 bg-[#88042b] text-white font-bold rounded-lg hover:bg-[#c41e3a] transition-colors shadow-md"
                >
                  รับออเดอร์ถัดไป
                </button>
              </div>
              
              <div className="absolute -top-3 -right-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
