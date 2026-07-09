// ============================================================
// HOBI Cuisine — Seed Data (Chinese Restaurant)
// ============================================================

import { db } from './database';
import type {
  User,
  MenuCategory,
  MenuItem,
  Promotion,
  LoyaltyTransaction,
  DiningTable,
} from '@/types';

const now = new Date().toISOString();



// --- Demo Users ---
const demoUsers: User[] = [
  {
    name: 'สมชาย ลูกค้าตัวอย่าง',
    email: 'demo@hobi.com',
    phone: '0812345678',
    password: '1234',
    role: 'customer',
    loyaltyTier: 'silver',
    loyaltyPoints: 780,
    totalSpent: 8450,
    totalOrders: 12,
    birthday: '1995-03-15',
    address: '123 ถ.สุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
    lastOrderAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'สุดา แม่ค้า',
    email: 'admin@hobi.com',
    phone: '0898765432',
    password: 'admin',
    role: 'admin',
    loyaltyTier: 'bronze',
    loyaltyPoints: 0,
    totalSpent: 0,
    totalOrders: 0,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'พ่อครัวหลี',
    email: 'kitchen@hobi.com',
    phone: '0876543210',
    password: '1234',
    role: 'kitchen',
    loyaltyTier: 'bronze',
    loyaltyPoints: 0,
    totalSpent: 0,
    totalOrders: 0,
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'มะลิ ลูกค้าทอง',
    email: 'gold@hobi.com',
    phone: '0891112233',
    password: '1234',
    role: 'customer',
    loyaltyTier: 'gold',
    loyaltyPoints: 2150,
    totalSpent: 24500,
    totalOrders: 38,
    birthday: '1988-08-08',
    address: '456 ถ.ราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330',
    lastOrderAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'วิชัย ลูกค้าใหม่',
    email: 'new@hobi.com',
    phone: '0834445566',
    password: '1234',
    role: 'customer',
    loyaltyTier: 'bronze',
    loyaltyPoints: 50,
    totalSpent: 350,
    totalOrders: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Menu Categories ---
const categories: MenuCategory[] = [
  { name: 'ติ่มซำ', nameEn: 'Dim Sum', icon: '🥟', sortOrder: 1, isActive: true },
  { name: 'เส้น & ก๋วยเตี๋ยว', nameEn: 'Noodles', icon: '🍜', sortOrder: 2, isActive: true },
  { name: 'ข้าว', nameEn: 'Rice Dishes', icon: '🍚', sortOrder: 3, isActive: true },
  { name: 'กับข้าว', nameEn: 'Main Course', icon: '🥘', sortOrder: 4, isActive: true },
  { name: 'ของทานเล่น', nameEn: 'Appetizers', icon: '🥗', sortOrder: 5, isActive: true },
  { name: 'ซุป', nameEn: 'Soups', icon: '🍲', sortOrder: 6, isActive: true },
  { name: 'เครื่องดื่ม', nameEn: 'Beverages', icon: '🥤', sortOrder: 7, isActive: true },
  { name: 'ของหวาน', nameEn: 'Desserts', icon: '🍮', sortOrder: 8, isActive: true },
  { name: 'สลัด', nameEn: 'Salad', icon: '🥗', sortOrder: 9, isActive: true },
  { name: 'อาหารจานเดียว', nameEn: 'A La Carte', icon: '🍛', sortOrder: 10, isActive: true },
  { name: 'ขนมปัง', nameEn: 'Bread', icon: '🥖', sortOrder: 11, isActive: true },
];

// --- Size / Spice options reused across items ---
const sizeOption = {
  name: 'ขนาด',
  choices: [
    { label: 'ปกติ', priceAdd: 0 },
    { label: 'พิเศษ', priceAdd: 20 },
  ],
};

const spiceOption = {
  name: 'ระดับความเผ็ด',
  choices: [
    { label: 'ไม่เผ็ด', priceAdd: 0 },
    { label: 'เผ็ดน้อย', priceAdd: 0 },
    { label: 'เผ็ดกลาง', priceAdd: 0 },
    { label: 'เผ็ดมาก', priceAdd: 0 },
  ],
};

const noodleTypeOption = {
  name: 'ชนิดเส้น',
  choices: [
    { label: 'เส้นเล็ก', priceAdd: 0 },
    { label: 'เส้นใหญ่', priceAdd: 0 },
    { label: 'บะหมี่', priceAdd: 0 },
    { label: 'วุ้นเส้น', priceAdd: 0 },
  ],
};

// --- Menu Items (mapped by categoryId index+1) ---
const menuItems: Omit<MenuItem, 'id' | 'createdAt'>[] = [
  // ── สลัด (Cat 9) ──
  {
    categoryId: 9, name: 'สลัดแซลมอนรมควัน', nameEn: 'Smoked Salmon Salad',
    description: 'สลัดผักออร์แกนิคสดใหม่ ท็อปด้วยแซลมอนรมควันชิ้นโต',
    price: 189, isAvailable: true, isPopular: true, preparationTime: 10,
    options: [], addons: [{ name: 'ไข่ต้ม', price: 15 }], imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
  },
  
  // ── อาหารจานเดียว (Cat 10) ──
  {
    categoryId: 10, name: 'สปาเก็ตตี้คาโบนาร่า', nameEn: 'Spaghetti Carbonara',
    description: 'สปาเก็ตตี้ซอสครีมเห็ดทรัฟเฟิล เบคอนกรอบ หอมมัน',
    price: 159, isAvailable: true, isPopular: true, preparationTime: 15,
    options: [], addons: [{ name: 'เพิ่มเบคอน', price: 30 }], imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=600&auto=format&fit=crop',
  },
  {
    categoryId: 10, name: 'สเต็กเนื้อซี่โครง', nameEn: 'Ribeye Steak',
    description: 'สเต็กเนื้อริบอายพรีเมียม ย่างไฟอ่อน เสิร์ฟพร้อมมันบด',
    price: 450, isAvailable: true, isPopular: true, preparationTime: 20,
    options: [{ name: 'ความสุก', choices: [{ label: 'Medium Rare', priceAdd: 0 }, { label: 'Medium', priceAdd: 0 }, { label: 'Well Done', priceAdd: 0 }] }],
    addons: [], imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600&auto=format&fit=crop',
  },
  {
    categoryId: 10, name: 'พอร์คช็อป', nameEn: 'Pork Chop Steak',
    description: 'พอร์คช็อปชิ้นหนานุ่ม ราดซอสพริกไทยดำ',
    price: 259, isAvailable: true, isPopular: false, preparationTime: 20,
    options: [], addons: [{ name: 'เพิ่มเฟรนช์ฟรายส์', price: 40 }], imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=600&auto=format&fit=crop',
  },
  {
    categoryId: 10, name: 'ซี่โครงหมูบาร์บีคิว', nameEn: 'BBQ Pork Ribs',
    description: 'ซี่โครงหมูหมักซอสบาร์บีคิวสูตรพิเศษ อบจนเปื่อย',
    price: 350, isAvailable: true, isPopular: true, preparationTime: 25,
    options: [], addons: [], imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
  },

  // ── ขนมปัง (Cat 11) ──
  {
    categoryId: 11, name: 'ครัวซองต์', nameEn: 'Croissant',
    description: 'ครัวซองต์เนยฝรั่งเศส หอมกรอบนอกนุ่มใน',
    price: 85, isAvailable: true, isPopular: true, preparationTime: 5,
    options: [], addons: [{ name: 'แยมสตรอเบอรี่', price: 15 }], imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?q=80&w=600&auto=format&fit=crop',
  },
  {
    categoryId: 11, name: 'ขนมปังเนยกระเทียม', nameEn: 'Garlic Butter Bread',
    description: 'ขนมปังฝรั่งเศสอบเนยกระเทียม หอมกรุ่น',
    price: 65, isAvailable: true, isPopular: false, preparationTime: 8,
    options: [], addons: [], imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=600&auto=format&fit=crop',
  },
];

// --- Promotions ---
const promotions: Omit<Promotion, 'id'>[] = [
  {
    code: 'WELCOME15',
    title: '🎉 ยินดีต้อนรับ! ลด 15%',
    description: 'สมาชิกใหม่รับส่วนลด 15% สำหรับออเดอร์แรก',
    type: 'percentage',
    value: 15,
    minOrderAmount: 200,
    maxDiscount: 150,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 1,
    usedCount: 0,
    createdAt: now,
  },
  {
    code: 'HOBI50',
    title: '🔥 สั่ง ฿500 ขึ้นไป ลด ฿50',
    description: 'รับส่วนลด ฿50 ทันที เมื่อสั่งครบ ฿500',
    type: 'fixed_amount',
    value: 50,
    minOrderAmount: 500,
    maxDiscount: 50,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 100,
    usedCount: 23,
    createdAt: now,
  },
  {
    code: 'DOUBLE WED',
    title: '⭐ แต้ม x2 ทุกวันพุธ',
    description: 'สะสมแต้มเป็น 2 เท่า ทุกวันพุธ!',
    type: 'points_multiplier',
    value: 2,
    minOrderAmount: 0,
    maxDiscount: 0,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 999,
    usedCount: 45,
    createdAt: now,
  },
  {
    code: 'DIMSUM3+1',
    title: '🥟 ติ่มซำ ซื้อ 3 แถม 1',
    description: 'สั่งติ่มซำ 3 รายการ รับฟรี 1 รายการ (มูลค่าน้อยสุด)',
    type: 'free_item',
    value: 1,
    minOrderAmount: 0,
    maxDiscount: 89,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 50,
    usedCount: 12,
    createdAt: now,
  },
  {
    code: 'BDAY20',
    title: '🎂 วันเกิดลด 20%',
    description: 'ฉลองวันเกิดกับ HOBI! รับส่วนลด 20% ตลอดเดือนเกิด',
    type: 'percentage',
    value: 20,
    minOrderAmount: 300,
    maxDiscount: 300,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 1,
    usedCount: 0,
    tierRequired: 'silver',
    createdAt: now,
  },
  {
    code: 'GOLD100',
    title: '👑 Gold Member ลด ฿100',
    description: 'สิทธิพิเศษสำหรับสมาชิก Gold เท่านั้น!',
    type: 'fixed_amount',
    value: 100,
    minOrderAmount: 400,
    maxDiscount: 100,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    usageLimit: 5,
    usedCount: 0,
    tierRequired: 'gold',
    createdAt: now,
  },
];

// --- Seed Function ---
export async function seedDatabase() {
  const userCount = await db.users.count();
  const tableCount = await db.diningTables.count();
  const orderCount = await db.orders.count();
  if (userCount > 0 && tableCount > 0 && orderCount > 0) {
    // Already seeded
    return;
  }

  console.log('🌱 Seeding HOBI Cuisine database (Version 2)...');
  
  // Clear old data to prevent conflicts with old schema
  await db.users.clear();
  await db.menuCategories.clear();
  await db.menuItems.clear();
  await db.orders.clear();
  await db.loyaltyTransactions.clear();
  await db.promotions.clear();
  await db.userPromotions.clear();
  await db.diningTables.clear();

  // Users (Update demoUsers to use correct branchIds from DB if needed, but since it's fresh DB, 1 and 2 are fine)
  const userIds = await db.users.bulkAdd(demoUsers, { allKeys: true });

  // Categories
  const catIds = await db.menuCategories.bulkAdd(categories, { allKeys: true });

  // Menu Items — map categoryId to actual DB ids
  const itemsWithDates: MenuItem[] = menuItems.map((item) => ({
    ...item,
    categoryId: catIds[item.categoryId - 1], // Map 1-based index to actual ID
    createdAt: now,
  })) as MenuItem[];
  await db.menuItems.bulkAdd(itemsWithDates);

  // Promotions
  await db.promotions.bulkAdd(promotions as Promotion[]);

  // Loyalty transactions for demo user (Silver tier)
  const demoUserId = userIds[0];
  const loyaltyTxs: LoyaltyTransaction[] = [
    {
      userId: demoUserId,
      type: 'signup',
      points: 50,
      balance: 50,
      description: 'โบนัสสมัครสมาชิก',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: demoUserId,
      orderId: 1,
      type: 'earn',
      points: 85,
      balance: 135,
      description: 'สั่งอาหาร ฿850',
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: demoUserId,
      orderId: 2,
      type: 'earn',
      points: 120,
      balance: 255,
      description: 'สั่งอาหาร ฿1,200',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: demoUserId,
      type: 'redeem',
      points: -100,
      balance: 155,
      description: 'แลกส่วนลด ฿10',
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: demoUserId,
      orderId: 5,
      type: 'earn',
      points: 245,
      balance: 400,
      description: 'สั่งอาหาร ฿2,450',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: demoUserId,
      orderId: 8,
      type: 'earn',
      points: 380,
      balance: 780,
      description: 'สั่งอาหาร ฿3,800',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  await db.loyaltyTransactions.bulkAdd(loyaltyTxs);

  // Gold user loyalty
  const goldUserId = userIds[3];
  const goldTxs: LoyaltyTransaction[] = [
    {
      userId: goldUserId,
      type: 'signup',
      points: 50,
      balance: 50,
      description: 'โบนัสสมัครสมาชิก',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      userId: goldUserId,
      type: 'earn',
      points: 2100,
      balance: 2150,
      description: 'สะสมจากการสั่งอาหารหลายครั้ง',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  await db.loyaltyTransactions.bulkAdd(goldTxs);

  // --- Tables ---
  const demoTables: DiningTable[] = [
    { tableNumber: 'T01', capacity: 4, status: 'available', createdAt: now },
    { tableNumber: 'T02', capacity: 2, status: 'occupied', createdAt: now },
    { tableNumber: 'T03', capacity: 4, status: 'available', createdAt: now },
    { tableNumber: 'V01', capacity: 8, status: 'available', createdAt: now },
  ];
  await db.diningTables.bulkAdd(demoTables);

  // --- Orders ---
  const demoOrders = [
    {
      orderNumber: 'HOBI-20260709-001',
      userId: demoUserId,
      userName: 'สมชาย ลูกค้าตัวอย่าง',
      status: 'confirmed',
      orderType: 'dine-in',
      tableNumber: 'T02',
      deliveryFee: 0,
      items: [
        { menuItemId: itemsWithDates[0].id, itemName: itemsWithDates[0].name, price: itemsWithDates[0].price, quantity: 1, selectedOptions: [], selectedAddons: [], specialInstructions: '', status: 'pending', imageUrl: itemsWithDates[0].imageUrl },
        { menuItemId: itemsWithDates[1].id, itemName: itemsWithDates[1].name, price: itemsWithDates[1].price, quantity: 2, selectedOptions: [], selectedAddons: [], specialInstructions: 'ไม่ใส่ผักชี', status: 'pending', imageUrl: itemsWithDates[1].imageUrl }
      ],
      subtotal: itemsWithDates[0].price + (itemsWithDates[1].price * 2),
      discount: 0,
      pointsEarned: 10,
      pointsRedeemed: 0,
      pointsDiscount: 0,
      vat: Math.round((itemsWithDates[0].price + (itemsWithDates[1].price * 2)) * 0.07),
      total: (itemsWithDates[0].price + (itemsWithDates[1].price * 2)) + Math.round((itemsWithDates[0].price + (itemsWithDates[1].price * 2)) * 0.07),
      paymentMethod: 'promptpay',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      orderNumber: 'HOBI-20260709-002',
      userId: demoUserId,
      userName: 'ลูกค้า Walk-in',
      status: 'preparing',
      orderType: 'takeaway',
      deliveryFee: 0,
      items: [
        { menuItemId: itemsWithDates[2].id, itemName: itemsWithDates[2].name, price: itemsWithDates[2].price, quantity: 1, selectedOptions: [], selectedAddons: [], specialInstructions: '', status: 'preparing', imageUrl: itemsWithDates[2].imageUrl }
      ],
      subtotal: itemsWithDates[2].price,
      discount: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      pointsDiscount: 0,
      vat: Math.round(itemsWithDates[2].price * 0.07),
      total: itemsWithDates[2].price + Math.round(itemsWithDates[2].price * 0.07),
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    }
  ];
  await db.orders.bulkAdd(demoOrders as any);

  console.log('✅ Database seeded successfully!');
}
