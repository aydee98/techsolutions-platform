export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  products: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  shippingAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}