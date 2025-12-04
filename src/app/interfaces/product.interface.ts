export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  sku?: string;
  barcode?: string;
  supplier?: string;
  weight?: number;
  dimensions?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  categories: string[];
}