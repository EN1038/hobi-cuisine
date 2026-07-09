// ============================================================
// HOBI Cuisine — Order Service
// ============================================================

import { db } from '@/db/database';
import {
  createOrder as dbCreateOrder,
  getNextOrderNumber,
  updateOrderStatus as dbUpdateStatus,
  updateUser,
  getUserById,
} from '@/db/operations';
import { addLoyaltyPoints, calculatePointsEarned } from './loyaltyService';
import { broadcastService } from './broadcastService';
import type { Order, OrderStatus, CartItem, OrderType, PaymentMethod, OrderItem } from '@/types';

interface CreateOrderParams {
  userId: number;
  userName: string;
  items: CartItem[];
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  promoCode?: string;
  promoDescription?: string;
  pointsRedeemed: number;
  pointsDiscount: number;
  vat: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const orderNumber = await getNextOrderNumber();
  const now = new Date().toISOString();

  // Convert cart items to order items
  const orderItems: OrderItem[] = params.items.map((item) => ({
    menuItemId: item.menuItemId,
    itemName: item.name,
    price: item.price,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions,
    selectedAddons: item.selectedAddons,
    specialInstructions: item.specialInstructions,
    status: 'pending' as const,
    imageUrl: item.imageUrl,
  }));

  const pointsEarned = calculatePointsEarned(params.total);

  const order: Omit<Order, 'id'> = {
    orderNumber,
    userId: params.userId,
    userName: params.userName,
    status: 'confirmed',
    orderType: params.orderType,
    tableNumber: params.tableNumber,
    deliveryAddress: params.deliveryAddress,
    deliveryFee: params.deliveryFee,
    items: orderItems,
    subtotal: params.subtotal,
    discount: params.discount,
    promoCodeUsed: params.promoCode,
    promoDescription: params.promoDescription,
    pointsEarned,
    pointsRedeemed: params.pointsRedeemed,
    pointsDiscount: params.pointsDiscount,
    vat: params.vat,
    total: params.total,
    paymentMethod: params.paymentMethod,
    paymentStatus: 'paid',
    notes: params.notes,
    createdAt: now,
    updatedAt: now,
  };

  const id = await dbCreateOrder(order);
  const savedOrder = { ...order, id };

  // Award loyalty points
  await addLoyaltyPoints(params.userId, id, pointsEarned, params.total);

  // Update user stats
  const user = await getUserById(params.userId);
  if (user) {
    await updateUser(params.userId, {
      totalSpent: (user.totalSpent || 0) + params.total,
      totalOrders: (user.totalOrders || 0) + 1,
      lastOrderAt: now,
    });
  }

  // Broadcast to kitchen
  broadcastService.send('NEW_ORDER', savedOrder);

  return savedOrder;
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  await dbUpdateStatus(orderId, status);

  const order = await db.orders.get(orderId);
  broadcastService.send('ORDER_STATUS_UPDATE', { orderId, status, order });
}

export function calculateTotals(
  items: CartItem[],
  promoDiscount: number,
  pointsDiscount: number,
  deliveryFee: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = promoDiscount + pointsDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const vat = Math.round(taxableAmount * 0.07);
  const total = Math.max(0, taxableAmount + vat + deliveryFee);

  return { subtotal, discount: totalDiscount, vat, total };
}
