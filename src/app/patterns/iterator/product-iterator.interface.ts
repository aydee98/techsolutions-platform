import { Product } from '../../interfaces/product.interface';

export interface ProductIterator {
  hasNext(): boolean;
  next(): Product | null;
  current(): Product | null;
  reset(): void;
  getPosition(): number;
  getTotal(): number;
  getRemaining(): number;
  skip(count: number): void;
  peek(): Product | null;
  toArray(): Product[];
}