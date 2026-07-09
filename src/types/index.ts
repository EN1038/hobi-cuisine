// ============================================================
// HOBI Cuisine — TypeScript Type Definitions
// ============================================================

// --- User & Auth ---

export type UserRole = 'customer' | 'admin' | 'staff' | 'kitchen';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password: string; // Demo only — plain text
  role: UserRole;
  avatarUrl?: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  birthday?: string; // ISO date string
  address?: string;
  lastOrderAt?: string;
  createdAt: string;
}

// --- Menu ---

export interface MenuCategory {
  id?: number;
  name: string;
  nameEn?: string;
  icon: string; // Emoji
  sortOrder: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface MenuItemOption {
  name: string;
  choices: {
    label: string;
    priceAdd: number; // Additional price (0 if no extra)
  }[];
}

export interface MenuItemAddon {
  name: string;
  price: number;
}

export interface MenuItem {
  id?: number;
  categoryId: number;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number; // Minutes
  options: MenuItemOption[];
  addons: MenuItemAddon[];
  createdAt: string;
}

// --- Cart ---

export interface CartItem {
  id: string; // UUID for uniqueness (same item with different options = different cart items)
  menuItemId: number;
  name: string;
  price: number; // Base price
  quantity: number;
  selectedOptions: { optionName: string; choice: string; priceAdd: number }[];
  selectedAddons: { name: string; price: number }[];
  specialInstructions: string;
  imageUrl?: string;
  totalPrice: number; // (base + options + addons) × quantity
}

// --- Orders ---

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type PaymentMethod = 'promptpay' | 'credit_card' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Order {
  id?: number;
  orderNumber: string; // e.g. "HOBI-20260709-001"
  userId: number;
  userName: string;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCodeUsed?: string;
  promoDescription?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsDiscount: number; // THB value of redeemed points
  vat: number; // 7%
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  menuItemId: number;
  itemName: string; // Snapshot
  price: number; // Snapshot at time of order
  quantity: number;
  selectedOptions: { optionName: string; choice: string; priceAdd: number }[];
  selectedAddons: { name: string; price: number }[];
  specialInstructions: string;
  status: 'pending' | 'preparing' | 'ready';
  imageUrl?: string;
}

// --- Loyalty ---

export type LoyaltyTxType = 'earn' | 'redeem' | 'bonus' | 'expire' | 'signup';

export interface LoyaltyTransaction {
  id?: number;
  userId: number;
  orderId?: number;
  type: LoyaltyTxType;
  points: number; // positive for earn, negative for redeem
  balance: number; // Running balance after transaction
  description: string;
  createdAt: string;
}

// --- Promotions ---

export type PromoType =
  | 'percentage'
  | 'fixed_amount'
  | 'free_item'
  | 'points_multiplier';

export interface Promotion {
  id?: number;
  code: string;
  title: string;
  description: string;
  type: PromoType;
  value: number; // e.g. 10 for 10%, 50 for ฿50, 2 for 2x points
  minOrderAmount: number;
  maxDiscount: number; // Cap for percentage discounts
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  imageUrl?: string;
  tierRequired?: LoyaltyTier; // Minimum tier to use
  createdAt: string;
}

export interface UserPromotion {
  id?: number;
  userId: number;
  promotionId: number;
  usedAt: string;
}

// --- Broadcast Channel Events ---

export type BroadcastEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATE'
  | 'ITEM_STATUS_UPDATE'
  | 'ORDER_CANCELLED';

export interface BroadcastEvent {
  type: BroadcastEventType;
  payload: unknown;
  timestamp: string;
}

// --- Dashboard / Analytics ---

export interface DailySummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
}

export interface PopularItem {
  menuItemId: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CustomerSegment {
  label: string;
  labelEn: string;
  count: number;
  color: string;
}

// --- Tables ---

export interface DiningTable {
  id?: number;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  reservedPhone?: string;
  reservedAt?: string;
  createdAt: string;
}
