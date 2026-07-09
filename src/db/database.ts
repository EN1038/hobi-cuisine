// ============================================================
// HOBI Cuisine — Dexie.js Database Schema
// ============================================================

import Dexie, { type Table } from 'dexie';
import type {
  User,
  MenuCategory,
  MenuItem,
  Order,
  LoyaltyTransaction,
  Promotion,
  UserPromotion,
  DiningTable,
} from '@/types';

export class HobiDatabase extends Dexie {
  users!: Table<User, number>;
  menuCategories!: Table<MenuCategory, number>;
  menuItems!: Table<MenuItem, number>;
  orders!: Table<Order, number>;
  loyaltyTransactions!: Table<LoyaltyTransaction, number>;
  promotions!: Table<Promotion, number>;
  userPromotions!: Table<UserPromotion, number>;
  diningTables!: Table<DiningTable, number>;

  constructor() {
    super('HobiCuisineDB_v4');

    this.version(4).stores({
      users: '++id, email, phone, role, loyaltyTier',
      menuCategories: '++id, sortOrder, isActive',
      menuItems: '++id, categoryId, isAvailable, isPopular',
      orders: '++id, orderNumber, userId, status, orderType, paymentStatus, createdAt',
      loyaltyTransactions: '++id, userId, orderId, type, createdAt',
      promotions: '++id, code, isActive, startDate, endDate',
      userPromotions: '++id, userId, promotionId',
      diningTables: '++id, tableNumber, status',
    });
  }
}

export const db = new HobiDatabase();
