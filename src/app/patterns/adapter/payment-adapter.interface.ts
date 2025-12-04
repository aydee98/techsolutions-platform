import { PaymentResult } from '../../interfaces/payment-result.interface';

export interface PaymentAdapter {
  processPayment(amount: number, orderId: number, metadata?: any): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
  getStatus(transactionId: string): Promise<PaymentResult>;
}