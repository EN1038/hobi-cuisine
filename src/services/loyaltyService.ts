// ============================================================
// HOBI Cuisine — Loyalty Service
// ============================================================

import { addLoyaltyTransaction, getLoyaltyHistory, updateUser, getUserById } from '@/db/operations';
import type { LoyaltyTier, LoyaltyTransaction } from '@/types';

// ── Constants ──
const POINTS_PER_THB = 0.1; // 1 แต้ม ต่อ ฿10
const POINTS_TO_THB = 0.1; // 100 แต้ม = ฿10

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
};

const TIER_NAMES: Record<LoyaltyTier, string> = {
  bronze: 'สมาชิกบรอนซ์',
  silver: 'สมาชิกซิลเวอร์',
  gold: 'สมาชิกโกลด์',
};

const TIER_BENEFITS: Record<LoyaltyTier, string[]> = {
  bronze: [
    'สะสมแต้ม 1 แต้ม ต่อ ฿10',
    'ใช้แต้มแลกส่วนลด',
    'รับโปรโมชั่นพิเศษ',
  ],
  silver: [
    'สะสมแต้ม 1.5 แต้ม ต่อ ฿10',
    'ใช้แต้มแลกส่วนลด',
    'รับโปรโมชั่นพิเศษ + Silver Exclusive',
    'ส่วนลดวันเกิด 20%',
    'ฟรีเครื่องดื่ม 1 แก้ว/เดือน',
  ],
  gold: [
    'สะสมแต้ม 2 แต้ม ต่อ ฿10',
    'ใช้แต้มแลกส่วนลด',
    'รับโปรโมชั่นทุกระดับ',
    'ส่วนลดวันเกิด 30%',
    'ฟรีเครื่องดื่ม 2 แก้ว/เดือน',
    'ที่จอดรถ VIP',
    'ส่วนลดพิเศษ ฿100 ต่อเดือน',
  ],
};

// ── Calculate points earned from an order ──
export function calculatePointsEarned(orderTotal: number, tier: LoyaltyTier = 'bronze'): number {
  const multiplier = tier === 'gold' ? 2 : tier === 'silver' ? 1.5 : 1;
  return Math.floor(orderTotal * POINTS_PER_THB * multiplier);
}

// ── Calculate THB discount from points ──
export function pointsToDiscount(points: number): number {
  return Math.floor(points * POINTS_TO_THB);
}

// ── Determine tier from total points earned (lifetime) ──
export function determineTier(totalPointsEarned: number): LoyaltyTier {
  if (totalPointsEarned >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalPointsEarned >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

// ── Points to next tier ──
export function pointsToNextTier(currentPoints: number, currentTier: LoyaltyTier): { nextTier: LoyaltyTier | null; pointsNeeded: number; progress: number } {
  if (currentTier === 'gold') {
    return { nextTier: null, pointsNeeded: 0, progress: 100 };
  }

  const nextTier = currentTier === 'bronze' ? 'silver' : 'gold';
  const threshold = TIER_THRESHOLDS[nextTier];
  const currentThreshold = TIER_THRESHOLDS[currentTier];
  const pointsNeeded = Math.max(0, threshold - currentPoints);
  const range = threshold - currentThreshold;
  const progress = Math.min(100, ((currentPoints - currentThreshold) / range) * 100);

  return { nextTier, pointsNeeded, progress };
}

// ── Add loyalty points after an order ──
export async function addLoyaltyPoints(
  userId: number,
  orderId: number,
  points: number,
  orderTotal: number
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;

  const newBalance = (user.loyaltyPoints || 0) + points;

  await addLoyaltyTransaction({
    userId,
    orderId,
    type: 'earn',
    points,
    balance: newBalance,
    description: `สั่งอาหาร ฿${orderTotal.toLocaleString()}`,
    createdAt: new Date().toISOString(),
  });

  // Update user points and tier
  const newTier = determineTier(newBalance);
  await updateUser(userId, {
    loyaltyPoints: newBalance,
    loyaltyTier: newTier,
  });
}

// ── Redeem points ──
export async function redeemPoints(
  userId: number,
  points: number,
  description: string
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || user.loyaltyPoints < points) return false;

  const newBalance = user.loyaltyPoints - points;

  await addLoyaltyTransaction({
    userId,
    type: 'redeem',
    points: -points,
    balance: newBalance,
    description,
    createdAt: new Date().toISOString(),
  });

  await updateUser(userId, { loyaltyPoints: newBalance });
  return true;
}

// ── Exports ──
export { TIER_THRESHOLDS, TIER_NAMES, TIER_BENEFITS, POINTS_PER_THB, POINTS_TO_THB };
