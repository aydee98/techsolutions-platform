import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../interfaces/product.interface';
import { ProductCatalogService } from '../../patterns/iterator/product-catalog.service';
import { ProductIterator } from '../../patterns/iterator/product-iterator.interface';
import { CatalogIterator } from '../../patterns/iterator/catalog-iterator';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  // Lista completa de productos
  allProducts: Product[] = [];
  
  // Productos mostrados en la página actual
  displayedProducts: Product[] = [];
  
  // Producto seleccionado para edición
  selectedProduct: Product | null = null;
  
  // Nuevo producto
  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 10,
    category: 'General'
  };
  
  // Filtros
  searchTerm = '';
  categoryFilter = '';
  priceRange = { min: 0, max: 10000 };
  stockFilter = '';
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Iterator Pattern
  productIterator: ProductIterator | null = null;
  iteratorPosition = 0;
  iteratorTotal = 0;
  
  // Categorías únicas
  categories: string[] = [];
  
  // Estadísticas
  stats = {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    averagePrice: 0
  };
  
  // Modo de navegación
  navigationMode: 'pagination' | 'iterator' = 'pagination';
  
  // Ordenamiento
  sortField: keyof Product = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private productCatalog: ProductCatalogService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.setupIterator();
    this.calculateStats();
  }

  private loadProducts(): void {
    // Productos de muestra
    this.allProducts = [
      {
        id: 1,
        name: 'Laptop HP Pavilion 15',
        description: 'Laptop 15.6" Core i5-1135G7, 8GB RAM, 512GB SSD, Windows 11',
        price: 2499.99,
        stock: 15,
        minStock: 10,
        category: 'Electrónicos',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: 2,
        name: 'Mouse Inalámbrico Logitech MX Master 3',
        description: 'Mouse ergonómico inalámbrico, 4000 DPI, batería 70 días',
        price: 89.99,
        stock: 5,
        minStock: 20,
        category: 'Accesorios',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-03-22')
      },
      {
        id: 3,
        name: 'Teclado Mecánico Redragon K552',
        description: 'Teclado gaming mecánico RGB Outemu Blue, anti-ghosting',
        price: 319.99,
        stock: 25,
        minStock: 15,
        category: 'Accesorios',
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-03-18')
      },
      {
        id: 4,
        name: 'Monitor Samsung Odyssey G5 27"',
        description: 'Monitor gaming 1440p 144Hz, 1ms, FreeSync Premium',
        price: 849.99,
        stock: 8,
        minStock: 10,
        category: 'Electrónicos',
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: 5,
        name: 'Impresora Epson EcoTank L3250',
        description: 'Impresora multifuncional tanque de tinta, WiFi, scanner',
        price: 1199.99,
        stock: 3,
        minStock: 5,
        category: 'Oficina',
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: 6,
        name: 'Disco Duro Externo Seagate 2TB',
        description: 'Disco duro externo USB 3.0, 2TB, resistencia al agua',
        price: 199.99,
        stock: 32,
        minStock: 15,
        category: 'Almacenamiento',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-28')
      },
      {
        id: 7,
        name: 'Tablet Samsung Galaxy Tab S7',
        description: 'Tablet 11" 120Hz, S-Pen, 6GB RAM, 128GB, 5G',
        price: 1799.99,
        stock: 12,
        minStock: 8,
        category: 'Electrónicos',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-03-22')
      },
      {
        id: 8,
        name: 'Audífonos Sony WH-1000XM4',
        description: 'Audífonos inalámbricos noise cancelling, 30h batería',
        price: 399.99,
        stock: 18,
        minStock: 12,
        category: 'Audio',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-24')
      },
      {
        id: 9,
        name: 'Router WiFi 6 TP-Link Archer AX73',
        description: 'Router dual band 5400Mbps, 8 antenas, MU-MIMO',
        price: 259.99,
        stock: 7,
        minStock: 10,
        category: 'Redes',
        createdAt: new Date('2024-03-08'),
        updatedAt: new Date('2024-03-26')
      },
      {
        id: 10,
        name: 'Webcam Logitech C920 Pro',
        description: 'Webcam Full HD 1080p, autofoco, micrófono estéreo',
        price: 129.99,
        stock: 0,
        minStock: 10,
        category: 'Accesorios',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-03-20')
      }
    ];

    this.extractCategories();
    this.applyFilters();
  }

  private setupIterator(): void {
    this.productIterator = this.productCatalog.getIterator();
    this.iteratorTotal = this.allProducts.length;
  }

  private extractCategories(): void {
    this.categories = [...new Set(this.allProducts.map(p => p.category))].sort();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de categoría
    if (this.categoryFilter) {
      filtered = filtered.filter(p => p.category === this.categoryFilter);
    }

    // Aplicar filtro de precio
    filtered = filtered.filter(p => 
      p.price >= this.priceRange.min && 
      p.price <= this.priceRange.max
    );

    // Aplicar filtro de stock
    if (this.stockFilter === 'low') {
      filtered = filtered.filter(p => p.stock <= p.minStock && p.stock > 0);
    } else if (this.stockFilter === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (this.stockFilter === 'good') {
      filtered = filtered.filter(p => p.stock > p.minStock);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const aVal = a[this.sortField];
      const bVal = b[this.sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' 
          ? aVal - bVal
          : bVal - aVal;
      }
      
      return 0;
    });

    // Actualizar datos según modo de navegación
    if (this.navigationMode === 'pagination') {
      this.updatePagination(filtered);
    } else {
      this.updateIterator(filtered);
    }

    this.calculateStats();
  }

  private updatePagination(filteredProducts: Product[]): void {
    this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.displayedProducts = filteredProducts.slice(startIndex, endIndex);
  }

  private updateIterator(filteredProducts: Product[]): void {
    // Crear nuevo iterador con los productos filtrados
    this.productIterator = new CatalogIterator(filteredProducts);
    this.iteratorTotal = filteredProducts.length;
    this.iteratorPosition = 0;
    
    // Obtener primeros productos para mostrar
    this.loadNextProducts();
  }

  loadNextProducts(): void {
    if (!this.productIterator) return;
    
    const products: Product[] = [];
    let count = 0;
    
    while (this.productIterator.hasNext() && count < this.itemsPerPage) {
      const product = this.productIterator.next();
      if (product) {
        products.push(product);
        count++;
      }
    }
    
    this.displayedProducts = products;
    this.iteratorPosition = this.productIterator.getPosition();
  }

  loadPreviousProducts(): void {
    if (!this.productIterator) return;
    
    // Para simular navegación hacia atrás, recreamos el iterador
    // En una implementación real, el iterador tendría métodos para retroceder
    this.currentPage = Math.max(1, this.currentPage - 1);
    this.navigationMode = 'pagination';
    this.applyFilters();
  }

  resetIterator(): void {
    if (this.productIterator) {
      this.productIterator.reset();
      this.iteratorPosition = 0;
      this.loadNextProducts();
    }
  }

  addProduct(): void {
    if (!this.newProduct.name || !this.newProduct.price || this.newProduct.price <= 0) {
      this.toastr.warning('Completa los campos requeridos');
      return;
    }

    const newId = Math.max(...this.allProducts.map(p => p.id)) + 1;
    
    const product: Product = {
      id: newId,
      name: this.newProduct.name || '',
      description: this.newProduct.description || '',
      price: this.newProduct.price || 0,
      stock: this.newProduct.stock || 0,
      minStock: this.newProduct.minStock || 10,
      category: this.newProduct.category || 'General',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.allProducts.unshift(product);
    this.extractCategories();
    this.applyFilters();
    this.resetProductForm();
    
    this.toastr.success(`Producto "${product.name}" agregado exitosamente`);
  }

  editProduct(product: Product): void {
    this.selectedProduct = { ...product };
  }

  updateProduct(): void {
    if (!this.selectedProduct) return;

    const index = this.allProducts.findIndex(p => p.id === this.selectedProduct!.id);
    
    if (index !== -1) {
      this.allProducts[index] = {
        ...this.selectedProduct,
        updatedAt: new Date()
      };

      this.applyFilters();
      this.cancelEdit();
      this.toastr.success('Producto actualizado exitosamente');
    }
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.allProducts = this.allProducts.filter(p => p.id !== id);
      this.applyFilters();
      this.toastr.info('Producto eliminado');
    }
  }

  duplicateProduct(product: Product): void {
    const newId = Math.max(...this.allProducts.map(p => p.id)) + 1;
    
    const duplicate: Product = {
      ...product,
      id: newId,
      name: `${product.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.allProducts.unshift(duplicate);
    this.applyFilters();
    this.toastr.success('Producto duplicado exitosamente');
  }

  resetProductForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      minStock: 10,
      category: 'General'
    };
  }

  cancelEdit(): void {
    this.selectedProduct = null;
  }

  calculateStats(): void {
    this.stats.totalProducts = this.allProducts.length;
    this.stats.lowStock = this.allProducts.filter(p => 
      p.stock <= p.minStock && p.stock > 0
    ).length;
    this.stats.outOfStock = this.allProducts.filter(p => p.stock === 0).length;
    
    this.stats.totalValue = this.allProducts.reduce(
      (sum, p) => sum + (p.price * p.stock), 0
    );
    
    this.stats.averagePrice = this.allProducts.length > 0
      ? this.allProducts.reduce((sum, p) => sum + p.price, 0) / this.allProducts.length
      : 0;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    const pageNum = Number(page);
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum;
      this.applyFilters();
    }
  }

  changeItemsPerPage(count: string | number): void {
    const countNum = typeof count === 'string' ? parseInt(count, 10) : count;
    this.itemsPerPage = countNum;
    this.currentPage = 1;
    this.applyFilters();
  }

  changeNavigationMode(mode: 'pagination' | 'iterator'): void {
    this.navigationMode = mode;
    this.applyFilters();
  }

  sortBy(field: keyof Product): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: keyof Product): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '⬆️' : '⬇️';
  }

  getStockStatus(stock: number, minStock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= minStock) return 'Stock Bajo';
    if (stock <= minStock * 2) return 'Stock Medio';
    return 'Stock Suficiente';
  }

  getStockStatusClass(stock: number, minStock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock <= minStock) return 'low-stock';
    if (stock <= minStock * 2) return 'medium-stock';
    return 'good-stock';
  }

  getStockStatusIcon(stock: number, minStock: number): string {
    if (stock === 0) return '❌';
    if (stock <= minStock) return '⚠️';
    if (stock <= minStock * 2) return '🔸';
    return '✅';
  }

  // MÉTODO NUEVO AGREGADO PARA EL TEMPLATE
  calculateStockPercentage(stock: number, minStock: number): number {
    if (minStock <= 0) return 100; // Evitar división por cero
    
    // Usar minStock * 2 como referencia del 100%
    const referenceStock = minStock * 2;
    const percentage = (stock / referenceStock) * 100;
    
    // Limitar entre 0 y 100
    return Math.min(Math.max(percentage, 0), 100);
  }

  exportToCSV(): void {
    const headers = ['ID', 'Nombre', 'Descripción', 'Categoría', 'Precio', 'Stock', 'Mínimo', 'Estado', 'Valor'];
    const rows = this.allProducts.map(p => [
      p.id.toString(),
      p.name,
      p.description,
      p.category,
      p.price.toFixed(2),
      p.stock.toString(),
      p.minStock.toString(),
      this.getStockStatus(p.stock, p.minStock),
      (p.price * p.stock).toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    this.toastr.success('Catálogo exportado a CSV');
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);
    
    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getProductValue(product: Product): number {
    return product.price * product.stock;
  }
}