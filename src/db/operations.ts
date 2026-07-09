// ============================================================
// HOBI Cuisine — Database Operations (CRUD)
// ============================================================

import { db } from './database';
import type {
  User,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  LoyaltyTransaction,
  Promotion,
  UserPromotion,
  DiningTable,
} from '@/types';



// ── Users ──

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.users.where('email').equalsIgnoreCase(email).first();
}

export async function getUserByPhone(phone: string): Promise<User | undefined> {
  return db.users.where('phone').equals(phone).first();
}

export async function getUserById(id: number): Promise<User | undefined> {
  return db.users.get(id);
}

export async function createUser(user: Omit<User, 'id'>): Promise<number> {
  return db.users.add(user as User);
}

export async function updateUser(id: number, updates: Partial<User>): Promise<void> {
  await db.users.update(id, updates);
}

export async function getAllCustomers(): Promise<User[]> {
  return db.users.where('role').equals('customer').toArray();
}

// ── Menu Categories ──

export async function getAllCategories(): Promise<MenuCategory[]> {
  const cats = await db.menuCategories.toArray();
  return cats.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addCategory(cat: Omit<MenuCategory, 'id'>): Promise<number> {
  return db.menuCategories.add(cat as MenuCategory);
}

export async function updateCategory(id: number, updates: Partial<MenuCategory>): Promise<void> {
  await db.menuCategories.update(id, updates);
}

export async function deleteCategory(id: number): Promise<void> {
  await db.menuCategories.delete(id);
}

// ── Menu Items ──

export async function getAllMenuItems(): Promise<MenuItem[]> {
  return db.menuItems.toArray();
}

export async function getAvailableMenuItems(): Promise<MenuItem[]> {
  const items = await db.menuItems.toArray();
  return items.filter(i => i.isAvailable);
}

export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
  return db.menuItems.where('categoryId').equals(categoryId).toArray();
}

export async function getPopularItems(): Promise<MenuItem[]> {
  const items = await db.menuItems.toArray();
  return items.filter(i => i.isPopular);
}

export async function getMenuItemById(id: number): Promise<MenuItem | undefined> {
  return db.menuItems.get(id);
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<number> {
  return db.menuItems.add(item as MenuItem);
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<void> {
  await db.menuItems.update(id, updates);
}

export async function deleteMenuItem(id: number): Promise<void> {
  await db.menuItems.delete(id);
}

// ── Orders ──

export async function createOrder(order: Omit<Order, 'id'>): Promise<number> {
  return db.orders.add(order as Order);
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  return db.orders.get(id);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  return db.orders.where('orderNumber').equals(orderNumber).first();
}

export async function getOrdersByUser(userId: number): Promise<Order[]> {
  return db.orders.where('userId').equals(userId).reverse().sortBy('createdAt');
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  return db.orders.where('status').equals(status).toArray();
}

export async function getActiveOrders(): Promise<Order[]> {
  const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];
  let orders: Order[] = [];
  
  for (const status of statuses) {
    const items = await db.orders.where('status').equals(status).toArray();
    orders.push(...items);
  }
  
  return orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getAllOrders(): Promise<Order[]> {
  return db.orders.reverse().sortBy('createdAt');
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await db.orders.update(id, { status, updatedAt: new Date().toISOString() });
}

export async function getNextOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `HOBI-${dateStr}`;

  const todayOrders = await db.orders
    .where('orderNumber')
    .startsWith(prefix)
    .toArray();

  const nextNum = todayOrders.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

// ── Loyalty ──

export async function addLoyaltyTransaction(tx: Omit<LoyaltyTransaction, 'id'>): Promise<number> {
  return db.loyaltyTransactions.add(tx as LoyaltyTransaction);
}

export async function getLoyaltyHistory(userId: number): Promise<LoyaltyTransaction[]> {
  return db.loyaltyTransactions
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('createdAt');
}

// ── Promotions ──

export async function getActivePromotions(): Promise<Promotion[]> {
  const now = new Date().toISOString();
  const all = await db.promotions.where('isActive').equals(1).toArray();
  return all.filter((p) => p.startDate <= now && p.endDate >= now);
}

export async function getAllPromotions(): Promise<Promotion[]> {
  return db.promotions.toArray();
}

export async function getPromotionByCode(code: string): Promise<Promotion | undefined> {
  return db.promotions.where('code').equals(code).first();
}

export async function addPromotion(promo: Omit<Promotion, 'id'>): Promise<number> {
  return db.promotions.add(promo as Promotion);
}

export async function updatePromotion(id: number, updates: Partial<Promotion>): Promise<void> {
  await db.promotions.update(id, updates);
}

export async function deletePromotion(id: number): Promise<void> {
  await db.promotions.delete(id);
}

// ── User Promotions (tracking usage) ──

export async function recordPromoUsage(usage: Omit<UserPromotion, 'id'>): Promise<void> {
  await db.userPromotions.add(usage as UserPromotion);
}

export async function hasUsedPromo(userId: number, promotionId: number): Promise<boolean> {
  const usage = await db.userPromotions
    .where('[userId+promotionId]')
    .equals([userId, promotionId])
    .first();
  return !!usage;
}

export async function getUserPromoUsageCount(userId: number, promotionId: number): Promise<number> {
  return db.userPromotions
    .where('userId')
    .equals(userId)
    .filter((up) => up.promotionId === promotionId)
    .count();
}

// ── Analytics / Dashboard ──

export async function getTodayOrders(): Promise<Order[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  let all = await db.orders.toArray();
  return all.filter((o) => new Date(o.createdAt) >= todayStart);
}

export async function getOrdersInRange(startDate: string, endDate: string): Promise<Order[]> {
  const all = await db.orders.toArray();
  return all.filter(
    (o) => o.createdAt >= startDate && o.createdAt <= endDate
  );
}

export async function getTopMenuItems(limit: number = 10): Promise<{ menuItemId: number; name: string; count: number; revenue: number }[]> {
  let orders = await db.orders.where('status').notEqual('cancelled').toArray();
  const itemMap = new Map<number, { name: string; count: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = itemMap.get(item.menuItemId) || { name: item.itemName, count: 0, revenue: 0 };
      existing.count += item.quantity;
      existing.revenue += item.price * item.quantity;
      itemMap.set(item.menuItemId, existing);
    }
  }

  return Array.from(itemMap.entries())
    .map(([menuItemId, data]) => ({ menuItemId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ── Tables ──

export async function getAllTables(): Promise<DiningTable[]> {
  return db.diningTables.toArray();
}

export async function addTable(table: Omit<DiningTable, 'id'>): Promise<number> {
  return db.diningTables.add(table as DiningTable);
}

export async function updateTable(id: number, updates: Partial<DiningTable>): Promise<void> {
  await db.diningTables.update(id, updates);
}

export async function deleteTable(id: number): Promise<void> {
  await db.diningTables.delete(id);
}

export async function getTableByNumber(tableNumber: string): Promise<DiningTable | undefined> {
  return db.diningTables.where('tableNumber').equals(tableNumber).first();
}

export async function clearStaleReservations(): Promise<void> {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  
  const tables = await db.diningTables.where('status').equals('reserved').toArray();
  
  for (const table of tables) {
    if (table.reservedAt && table.reservedAt < thirtyMinsAgo) {
      // Stale reservation
      await updateTable(table.id!, {
        status: 'available',
        reservedPhone: undefined,
        reservedAt: undefined
      });
    }
  }
}
