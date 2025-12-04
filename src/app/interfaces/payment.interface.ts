// src/app/interfaces/payment.interface.ts
export interface Payment {
  id: number;
  orderId: number;
  gateway: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  date: string;
  processingFee: number;
  netAmount: number;
}