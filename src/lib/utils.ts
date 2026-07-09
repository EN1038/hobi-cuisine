// ============================================================
// HOBI Cuisine — Utility Functions
// ============================================================

import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { th } from 'date-fns/locale';
import type { OrderStatus, LoyaltyTier, OrderType } from '@/types';

// ── Price formatting ──
export function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

// ── Date formatting ──
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: th });
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy HH:mm น.', { locale: th });
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm น.', { locale: th });
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: th });
}

export function minutesElapsed(dateStr: string): number {
  return differenceInMinutes(new Date(), new Date(dateStr));
}

// ── Order status ──
const statusMap: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'รอยืนยัน', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
  preparing: { label: 'กำลังเตรียม', color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
  ready: { label: 'พร้อมเสิร์ฟ', color: 'text-green-400', bgColor: 'bg-green-400/20' },
  completed: { label: 'เสร็จสมบูรณ์', color: 'text-gray-400', bgColor: 'bg-gray-400/20' },
  cancelled: { label: 'ยกเลิก', color: 'text-red-400', bgColor: 'bg-red-400/20' },
};

export function getStatusInfo(status: OrderStatus) {
  return statusMap[status];
}

// ── Order type ──
const orderTypeMap: Record<OrderType, { label: string; icon: string }> = {
  'dine-in': { label: 'ทานที่ร้าน', icon: '🍽️' },
  takeaway: { label: 'สั่งกลับบ้าน', icon: '🥡' },
  delivery: { label: 'จัดส่ง', icon: '🛵' },
};

export function getOrderTypeInfo(type: OrderType) {
  return orderTypeMap[type];
}

// ── Loyalty tier ──
const tierMap: Record<LoyaltyTier, { label: string; color: string; gradient: string; icon: string }> = {
  bronze: {
    label: 'Bronze',
    color: 'text-amber-600',
    gradient: 'from-amber-700 to-amber-500',
    icon: '🥉',
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-300',
    gradient: 'from-gray-400 to-gray-200',
    icon: '🥈',
  },
  gold: {
    label: 'Gold',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-300',
    icon: '🥇',
  },
};

export function getTierInfo(tier: LoyaltyTier) {
  return tierMap[tier];
}

// ── Kitchen urgency ──
export function getUrgencyColor(minutes: number): { bg: string; text: string; label: string } {
  if (minutes < 5) return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'ปกติ' };
  if (minutes < 10) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'เร่งด่วน' };
  return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'เลยเวลา!' };
}

// ── Generate UUID ──
export function generateId(): string {
  return crypto.randomUUID();
}

// ── Class merge (cn utility) ──
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
