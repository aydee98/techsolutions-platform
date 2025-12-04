import { Product } from '../../interfaces/product.interface';
import { ProductIterator } from './product-iterator.interface';

export class CatalogIterator implements ProductIterator {
  private position: number = 0;
  private products: Product[];

  constructor(products: Product[]) {
    this.products = [...products];
  }

  hasNext(): boolean {
    return this.position < this.products.length;
  }

  next(): Product | null {
    if (this.position >= this.products.length) {
      return null;
    }
    
    const product = this.products[this.position];
    this.position++;
    return { ...product }; // Retornar copia para evitar mutaciones
  }

  current(): Product | null {
    if (this.position === 0 || this.position > this.products.length) {
      return null;
    }
    return { ...this.products[this.position - 1] };
  }

  reset(): void {
    this.position = 0;
    console.log('🔄 Iterador reiniciado');
  }

  getPosition(): number {
    return this.position;
  }

  getTotal(): number {
    return this.products.length;
  }

  getRemaining(): number {
    return this.products.length - this.position;
  }

  skip(count: number): void {
    this.position = Math.min(this.position + count, this.products.length);
  }

  peek(): Product | null {
    if (this.position >= this.products.length) {
      return null;
    }
    return { ...this.products[this.position] };
  }

  toArray(): Product[] {
    return [...this.products];
  }

  getCurrentPage(pageSize: number): Product[] {
    const start = Math.floor(this.position / pageSize) * pageSize;
    const end = start + pageSize;
    return this.products.slice(start, end);
  }

  goToPage(page: number, pageSize: number): void {
    this.position = Math.min(page * pageSize, this.products.length);
  }

  getCurrentPageNumber(pageSize: number): number {
    return Math.floor(this.position / pageSize);
  }

  getTotalPages(pageSize: number): number {
    return Math.ceil(this.products.length / pageSize);
  }
}