import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Order, OrderItem } from '../interfaces/order.interface';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private lastOrderId = 1000;

  constructor() {
    this.loadSampleOrders();
  }

  private loadSampleOrders(): void {
    this.orders = [
      {
        id: 1001,
        customerName: 'Juan Pérez',
        customerEmail: 'juan@empresa.com',
        products: [
          { productId: 1, productName: 'Laptop HP Pavilion', quantity: 1, unitPrice: 2500, total: 2500 },
          { productId: 2, productName: 'Mouse Logitech', quantity: 2, unitPrice: 89, total: 178 }
        ],
        subtotal: 2678,
        discount: 267.8,
        total: 2410.2,
        status: 'Completed',
        paymentMethod: 'PayPal',
        paymentStatus: 'Paid',
        shippingAddress: 'Av. Principal 123, Lima',
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-21')
      }
    ];
    this.lastOrderId = 1001;
  }

  getOrders(): Observable<Order[]> {
    return of([...this.orders]).pipe(delay(500));
  }

  getOrderById(id: number): Observable<Order | null> {
    const order = this.orders.find(o => o.id === id);
    return of(order ? { ...order } : null).pipe(delay(300));
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    const newId = ++this.lastOrderId;
    
    const order: Order = {
      id: newId,
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      products: orderData.products || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      status: 'Pending',
      paymentStatus: 'Pending',
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.unshift(order);
    return of({ ...order }).pipe(delay(500));
  }

  updateOrder(id: number, updates: Partial<Order>): Observable<Order | null> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return of(null);
    }

    this.orders[index] = {
      ...this.orders[index],
      ...updates,
      updatedAt: new Date()
    };

    return of({ ...this.orders[index] }).pipe(delay(500));
  }

  deleteOrder(id: number): Observable<boolean> {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== id);
    return of(this.orders.length < initialLength).pipe(delay(300));
  }

  updateOrderStatus(id: number, status: Order['status']): Observable<Order | null> {
    return this.updateOrder(id, { status });
  }

  applyDiscount(id: number, discountPercentage: number): Observable<Order | null> {
    const order = this.orders.find(o => o.id === id);
    
    if (!order) {
      return of(null);
    }

    const discountAmount = order.subtotal * (discountPercentage / 100);
    
    return this.updateOrder(id, {
      discount: discountAmount,
      total: order.subtotal - discountAmount
    });
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    const filtered = this.orders.filter(o => o.status === status);
    return of([...filtered]).pipe(delay(300));
  }

  getOrdersByDateRange(startDate: Date, endDate: Date): Observable<Order[]> {
    const filtered = this.orders.filter(o => 
      o.createdAt >= startDate && o.createdAt <= endDate
    );
    return of([...filtered]).pipe(delay(300));
  }

  getOrderStats(): Observable<any> {
    const stats = {
      totalOrders: this.orders.length,
      pending: this.orders.filter(o => o.status === 'Pending').length,
      processing: this.orders.filter(o => o.status === 'Processing').length,
      completed: this.orders.filter(o => o.status === 'Completed').length,
      cancelled: this.orders.filter(o => o.status === 'Cancelled').length,
      totalRevenue: this.orders
        .filter(o => o.status === 'Completed')
        .reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: 0
    };

    if (stats.completed > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.completed;
    }

    return of(stats).pipe(delay(500));
  }

  searchOrders(query: string): Observable<Order[]> {
    const filtered = this.orders.filter(o =>
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toString().includes(query)
    );
    return of([...filtered]).pipe(delay(300));
  }
}