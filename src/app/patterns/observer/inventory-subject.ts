// src/app/patterns/observer/inventory-subject.ts
import { Injectable } from '@angular/core';
import { InventoryObserver } from './inventory-observer.interface';

@Injectable({
  providedIn: 'root'
})
export class InventorySubject {
  private observers: InventoryObserver[] = [];
  
  // Adjuntar un observador
  attach(observer: InventoryObserver): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
      console.log(`Observador adjuntado. Total: ${this.observers.length}`);
    }
  }
  
  // Desadjuntar un observador
  detach(observer: InventoryObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
      console.log(`Observador desadjuntado. Total: ${this.observers.length}`);
    }
  }
  
  // Notificar a todos los observadores
  notify(productId: number, productName: string, currentStock: number, minStock: number): void {
    console.log(`📢 Notificando a ${this.observers.length} observadores sobre stock bajo`);
    
    for (const observer of this.observers) {
      observer.update(productId, productName, currentStock, minStock);
    }
  }
  
  // Obtener número de observadores
  getObserverCount(): number {
    return this.observers.length;
  }
}