// src/app/interfaces/notification.interface.ts
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  metadata?: any;
}

export interface LowStockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  lastRestock?: Date;
  urgency: 'Low' | 'Medium' | 'High';
}