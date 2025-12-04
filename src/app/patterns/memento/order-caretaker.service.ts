import { Injectable } from '@angular/core';
import { Order } from '../../interfaces/order.interface';
import { OrderMemento } from './order-memento';

@Injectable({
  providedIn: 'root'
})
export class OrderCaretakerService {
  private mementos: Map<number, OrderMemento[]> = new Map();
  private maxMementosPerOrder = 20;

  saveState(order: Order, description?: string): void {
    if (!this.mementos.has(order.id)) {
      this.mementos.set(order.id, []);
    }

    const orderHistory = this.mementos.get(order.id)!;
    
    // Crear memento
    const memento = new OrderMemento(
      order.id,
      { ...order },
      new Date(),
      description || `Estado guardado - ${order.status}`
    );

    // Agregar al historial
    orderHistory.push(memento);

    // Limitar tamaño del historial
    if (orderHistory.length > this.maxMementosPerOrder) {
      orderHistory.shift();
    }

    console.log(`💾 Memento guardado para pedido #${order.id}: ${memento.getSummary()}`);
  }

  restoreState(orderId: number, stateIndex: number): Order | null {
    const orderHistory = this.mementos.get(orderId);
    
    if (!orderHistory || orderHistory.length <= stateIndex) {
      console.log(`⚠️ No se encontró memento para pedido #${orderId} en índice ${stateIndex}`);
      return null;
    }

    const memento = orderHistory[stateIndex];
    console.log(`🔄 Restaurando estado del pedido #${orderId} desde memento: ${memento.getSummary()}`);
    
    return memento.getState();
  }

  restoreLastState(orderId: number): Order | null {
    const orderHistory = this.mementos.get(orderId);
    
    if (!orderHistory || orderHistory.length === 0) {
      return null;
    }

    return this.restoreState(orderId, orderHistory.length - 1);
  }

  getHistory(orderId: number): OrderMemento[] {
    return this.mementos.get(orderId) || [];
  }

  clearHistory(orderId: number): void {
    if (this.mementos.has(orderId)) {
      this.mementos.set(orderId, []);
      console.log(`🧹 Historial limpiado para pedido #${orderId}`);
    }
  }

  getAllMementos(): Map<number, OrderMemento[]> {
    return new Map(this.mementos);
  }

  getOrderHistorySummary(orderId: number): string[] {
    const history = this.getHistory(orderId);
    return history.map((memento, index) => 
      `Versión ${index + 1}: ${memento.timestamp.toLocaleString()} - ${memento.description}`
    );
  }

  hasHistory(orderId: number): boolean {
    return this.mementos.has(orderId) && (this.mementos.get(orderId)?.length || 0) > 0;
  }
}