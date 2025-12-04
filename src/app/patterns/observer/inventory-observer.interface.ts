// src/app/patterns/observer/inventory-observer.interface.ts
export interface InventoryObserver {
  update(productId: number, productName: string, currentStock: number, minStock: number): void;
}