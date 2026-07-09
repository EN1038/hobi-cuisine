'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Minus } from 'lucide-react';
import { getAllCategories, getAvailableMenuItems } from '@/db/operations';
import { useCartStore } from '@/stores/cartStore';
import { useAppStore } from '@/stores/appStore';
import { formatPrice, generateId } from '@/lib/utils';
import type { MenuCategory, MenuItem, CartItem } from '@/types';

import { Suspense } from 'react';

const MenuContent = () => {
  const searchParams = useSearchParams();
  const catIdParam = searchParams.get('cat');
  const itemIdParam = searchParams.get('item');
  const tableParam = searchParams.get('table');

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { choice: string; priceAdd: number }>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, { name: string; price: number }>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  const cart = useCartStore();
  const dbReady = useAppStore((s) => s.dbReady);

  useEffect(() => {
    if (!dbReady) return;
    async function load() {
      const [cats, items] = await Promise.all([
        getAllCategories(),
        getAvailableMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      
      if (catIdParam) {
        setActiveCategory(Number(catIdParam));
      }
      
      if (itemIdParam) {
        const item = items.find(i => i.id === Number(itemIdParam));
        if (item) openModal(item);
      }
      
      if (tableParam) {
        cart.setOrderType('dine-in');
        cart.setTableNumber(tableParam);
      }
      
      setLoading(false);
    }
    load();
  }, [dbReady, catIdParam, itemIdParam, tableParam]);

  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSpecialInstructions('');
    
    // Default options (first choice for each option)
    const initialOptions: Record<string, { choice: string; priceAdd: number }> = {};
    item.options?.forEach(opt => {
      if (opt.choices.length > 0) {
        initialOptions[opt.name] = { 
          choice: opt.choices[0].label, 
          priceAdd: opt.choices[0].priceAdd 
        };
      }
    });
    setSelectedOptions(initialOptions);
    setSelectedAddons({});
  };

  const closeModal = () => setSelectedItem(null);

  const handleOptionChange = (optionName: string, choiceLabel: string, priceAdd: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: { choice: choiceLabel, priceAdd }
    }));
  };

  const handleAddonChange = (addonName: string, price: number, checked: boolean) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (checked) {
        next[addonName] = { name: addonName, price };
      } else {
        delete next[addonName];
      }
      return next;
    });
  };

  const calculateItemTotal = () => {
    if (!selectedItem) return 0;
    
    let total = selectedItem.price;
    
    // Add options price
    Object.values(selectedOptions).forEach(opt => {
      total += opt.priceAdd;
    });
    
    // Add addons price
    Object.values(selectedAddons).forEach(addon => {
      total += addon.price;
    });
    
    return total * quantity;
  };

  const addToCart = () => {
    if (!selectedItem) return;
    
    const optionsArray = Object.entries(selectedOptions).map(([optionName, data]) => ({
      optionName,
      choice: data.choice,
      priceAdd: data.priceAdd
    }));
    
    const addonsArray = Object.values(selectedAddons);
    
    const cartItem: CartItem = {
      id: generateId(),
      menuItemId: selectedItem.id!,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      selectedOptions: optionsArray,
      selectedAddons: addonsArray,
      specialInstructions,
      imageUrl: selectedItem.imageUrl,
      totalPrice: calculateItemTotal()
    };
    
    cart.addItem(cartItem);
    closeModal();
    
    // Show toast using a simple alert for now (in real app, use toast system)
    // alert('เพิ่มลงตะกร้าแล้ว');
  };

  if (loading) {
    return (
      <div className="pb-24 pt-20 min-h-screen bg-[#f6e5cc] px-4">
        {/* Search skeleton */}
        <div className="sticky top-[64px] z-40 bg-[#f6e5cc]/95 backdrop-blur-md px-4 py-3 border-b border-yellow-900/10 mb-4">
          <div className="h-10 bg-white/60 rounded-xl animate-pulse max-w-3xl mx-auto" />
        </div>
        {/* Category skeleton */}
        <div className="flex gap-2 overflow-x-hidden mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-white/60 rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-20 max-w-7xl mx-auto px-4 min-h-screen bg-[#f6e5cc] text-gray-800">
      
      {/* Table Banner */}
      {cart.tableNumber && (
        <div className="bg-[#88042b] text-[#f6e5cc] px-4 py-3 rounded-xl mb-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f6e5cc]/20 rounded-full flex items-center justify-center font-bold">
              {cart.tableNumber}
            </div>
            <div>
              <div className="text-sm font-bold">กำลังสั่งอาหารสำหรับโต๊ะนี้</div>
              <div className="text-xs opacity-80">ระบบจะส่งออเดอร์ไปที่โต๊ะ {cart.tableNumber} อัตโนมัติ</div>
            </div>
          </div>
          <button 
            onClick={() => cart.setTableNumber('')}
            className="text-[#f6e5cc]/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search Header - Sticky */}
      <div className="sticky top-[64px] z-40 bg-[#f6e5cc]/95 backdrop-blur-md px-4 py-3 border-b border-yellow-900/10">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="ค้นหาเมนูอาหาร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-yellow-900/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#88042b] focus:outline-none focus:border-[#88042b] transition-colors placeholder:text-gray-400 shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs - Scrollable */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide flex gap-2 border-b border-yellow-900/10 sticky top-[125px] z-30 bg-[#f6e5cc]">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
            activeCategory === 'all' 
              ? 'bg-[#88042b] text-[#f6e5cc]' 
              : 'bg-white text-[#88042b] hover:bg-[#88042b]/10 border border-yellow-900/10'
          }`}
        >
          ทั้งหมด
        </button>
        
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id!)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCategory === cat.id 
                ? 'bg-[#88042b] text-[#f6e5cc]' 
                : 'bg-white text-[#88042b] hover:bg-[#88042b]/10 border border-yellow-900/10'
            }`}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-[#88042b]">ไม่พบเมนูที่ค้นหา</h3>
            <p className="text-sm text-gray-500">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => openModal(item)}
                className="bg-white border border-yellow-900/10 hover:border-[#88042b]/50 rounded-2xl overflow-hidden cursor-pointer group flex flex-col shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-[#f6e5cc]/30 flex items-center justify-center text-5xl">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    categories.find(c => c.id === item.categoryId)?.icon || '🍽️'
                  )}
                  {item.isPopular && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg">
                      🔥 ยอดนิยม
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-[#88042b] line-clamp-1 mb-1 group-hover:text-red-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1 leading-snug">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-yellow-900/10">
                    <span className="font-bold text-black">{formatPrice(item.price)}</span>
                    <div className="w-7 h-7 rounded-full bg-[#f6e5cc] flex items-center justify-center text-[#88042b] group-hover:bg-[#88042b] group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[70] bg-white rounded-t-3xl md:rounded-3xl border border-yellow-900/10 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
            >
              {/* Image Header */}
              <div className="relative h-48 md:h-56 bg-[#f6e5cc]/50 flex items-center justify-center text-7xl shrink-0">
                {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  categories.find(c => c.id === selectedItem.categoryId)?.icon || '🍽️'
                )}
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-[#88042b] hover:bg-black/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                <div className="mb-5">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-xl font-bold text-[#88042b]">{selectedItem.name}</h2>
                    <span className="text-xl font-bold text-black">{formatPrice(selectedItem.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                </div>

                {/* Options (Radio) */}
                {selectedItem.options?.map(option => (
                  <div key={option.name} className="mb-5 border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-[#88042b]">{option.name}</h3>
                      <span className="text-xs bg-[#88042b]/10 text-[#88042b] px-2 py-0.5 rounded font-bold">จำเป็น</span>
                    </div>
                    <div className="space-y-2">
                      {option.choices.map(choice => (
                        <label key={choice.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={option.name}
                              checked={selectedOptions[option.name]?.choice === choice.label}
                              onChange={() => handleOptionChange(option.name, choice.label, choice.priceAdd)}
                              className="w-4 h-4 accent-[#88042b]"
                            />
                            <span className="text-sm font-medium text-black">{choice.label}</span>
                          </div>
                          {choice.priceAdd > 0 && (
                            <span className="text-sm font-bold text-black">+{formatPrice(choice.priceAdd)}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Addons (Checkbox) */}
                {selectedItem.addons && selectedItem.addons.length > 0 && (
                  <div className="mb-5 border-t border-gray-100 pt-4">
                    <h3 className="font-bold text-[#88042b] mb-3">เพิ่มท็อปปิ้ง (เลือกได้หลายอย่าง)</h3>
                    <div className="space-y-2">
                      {selectedItem.addons.map(addon => (
                        <label key={addon.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={!!selectedAddons[addon.name]}
                              onChange={(e) => handleAddonChange(addon.name, addon.price, e.target.checked)}
                              className="w-4 h-4 accent-[#88042b] rounded"
                            />
                            <span className="text-sm font-medium text-black">{addon.name}</span>
                          </div>
                          <span className="text-sm font-bold text-black">+{formatPrice(addon.price)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div className="mb-5 border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-[#88042b] mb-3">รายละเอียดเพิ่มเติม</h3>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อยมาก, ฯลฯ"
                    className="w-full h-20 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#88042b] transition-colors resize-none text-black placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-200 rounded-l-xl transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-10 text-center font-bold text-[#88042b]">{quantity}</div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-200 rounded-r-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Add Button */}
                  <button 
                    onClick={addToCart}
                    className="flex-1 h-12 bg-[#88042b] hover:bg-[#6a0321] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-[#f6e5cc] active:scale-[0.98]"
                  >
                    <span>เพิ่มลงตะกร้า</span>
                    <span>•</span>
                    <span>{formatPrice(calculateItemTotal())}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const MenuPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center text-[#88042b]">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
};

export default MenuPage;
