// ============================================================
// HOBI Cuisine — Payment Service (Mock/Demo)
// ============================================================

import type { PaymentMethod } from '@/types';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  timestamp: string;
}

// Generate a fake transaction ID
function generateTransactionId(method: PaymentMethod): string {
  const prefix = method === 'promptpay' ? 'PP' : method === 'credit_card' ? 'CC' : 'CA';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
}

// Simulate PromptPay QR payment
export function generatePromptPayQR(amount: number, phoneNumber: string = '0812345678'): string {
  // Generate a mock PromptPay payload
  // In production, use the `promptpay-qr` package
  // For demo, we create a simple payload string
  return `00020101021129370016A000000677010111${phoneNumber.padStart(13, '0')}5802TH53037645802TH5303764540${amount.toFixed(2)}6304`;
}

// Simulate payment processing
export async function processPayment(
  method: PaymentMethod,
  amount: number
): Promise<PaymentResult> {
  // Simulate network delay
  const delay = method === 'cash' ? 500 : method === 'promptpay' ? 3000 : 2000;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: generateTransactionId(method),
        method,
        amount,
        timestamp: new Date().toISOString(),
      });
    }, delay);
  });
}

// Validate mock credit card
export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  // Accept test card numbers
  return cleaned.length === 16 && /^\d+$/.test(cleaned);
}

// Format card number for display
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

// Get payment method display name
export function getPaymentMethodName(method: PaymentMethod): string {
  const names: Record<PaymentMethod, string> = {
    promptpay: 'พร้อมเพย์ QR',
    credit_card: 'บัตรเครดิต/เดบิต',
    cash: 'เงินสด (จ่ายที่ร้าน)',
  };
  return names[method];
}

// Get payment method icon
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const icons: Record<PaymentMethod, string> = {
    promptpay: '📱',
    credit_card: '💳',
    cash: '💵',
  };
  return icons[method];
}
