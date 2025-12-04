import { Injectable } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductIterator } from './product-iterator.interface';
import { CatalogIterator } from './catalog-iterator';

@Injectable({
  providedIn: 'root'
})
export class ProductCatalogService {
  private products: Product[] = [];

  constructor() {
    this.loadSampleProducts();
  }

  private loadSampleProducts(): void {
    // Este método se llenará dinámicamente desde el componente
    this.products = [];
  }

  setProducts(products: Product[]): void {
    this.products = [...products];
    console.log(`📦 Catálogo actualizado con ${this.products.length} productos`);
  }

  getIterator(): ProductIterator {
    return new CatalogIterator(this.products);
  }

  getFilteredIterator(filter: (product: Product) => boolean): ProductIterator {
    const filteredProducts = this.products.filter(filter);
    return new CatalogIterator(filteredProducts);
  }

  getPaginatedIterator(page: number, pageSize: number): ProductIterator {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = this.products.slice(start, end);
    return new CatalogIterator(paginatedProducts);
  }

  getSortedIterator(sortFn: (a: Product, b: Product) => number): ProductIterator {
    const sortedProducts = [...this.products].sort(sortFn);
    return new CatalogIterator(sortedProducts);
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  getProductCount(): number {
    return this.products.length;
  }

  getCategories(): string[] {
    const categories = new Set(this.products.map(p => p.category));
    return Array.from(categories).sort();
  }

  getStats(): {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  } {
    const total = this.products.length;
    const lowStock = this.products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStock = this.products.filter(p => p.stock === 0).length;
    const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return { total, lowStock, outOfStock, totalValue };
  }

  searchProducts(query: string): ProductIterator {
    const searchTerm = query.toLowerCase();
    const filtered = this.products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    return new CatalogIterator(filtered);
  }
}