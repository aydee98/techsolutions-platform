export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
  timestamp?: Date;
  metadata?: any;
}