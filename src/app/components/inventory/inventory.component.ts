import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { InventorySubject } from '../../patterns/observer/inventory-subject';
import { LowStockNotificationService } from '../../patterns/observer/low-stock-notification.service';
import { Notification } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  isEditing = false;
  newProduct: Partial<Product> = {};
  
  // Filtros
  searchTerm = '';
  categoryFilter = '';
  lowStockFilter = false;
  
  // Para Observer Pattern
  private inventorySubject = new InventorySubject();
  
  // Estadísticas
  stats = {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  };

  constructor(
    private productService: ProductService,
    private lowStockService: LowStockNotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.setupObserver();
  }

  private loadProducts(): void {
    // Simulación de datos
    this.products = [
      {
        id: 1,
        name: 'Laptop HP Pavilion',
        description: 'Laptop 15.6" Core i5, 8GB RAM, 512GB SSD',
        price: 2500,
        stock: 15,
        minStock: 10,
        category: 'Electrónicos',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: 2,
        name: 'Mouse Inalámbrico Logitech',
        description: 'Mouse óptico inalámbrico',
        price: 89,
        stock: 5,
        minStock: 20,
        category: 'Accesorios',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-03-22')
      },
      {
        id: 3,
        name: 'Teclado Mecánico Redragon',
        description: 'Teclado gaming mecánico RGB',
        price: 320,
        stock: 25,
        minStock: 15,
        category: 'Accesorios',
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-03-18')
      },
      {
        id: 4,
        name: 'Monitor Samsung 24"',
        description: 'Monitor Full HD 144Hz',
        price: 850,
        stock: 8,
        minStock: 10,
        category: 'Electrónicos',
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: 5,
        name: 'Impresora Epson EcoTank',
        description: 'Impresora multifuncional tanque de tinta',
        price: 1200,
        stock: 3,
        minStock: 5,
        category: 'Oficina',
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-25')
      }
    ];

    this.applyFilters();
    this.calculateStats();
  }

  private setupObserver(): void {
    // Registrar el servicio de notificaciones como observador
    this.inventorySubject.attach(this.lowStockService);
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Filtro por búsqueda
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = !this.categoryFilter || 
        product.category === this.categoryFilter;
      
      // Filtro por stock bajo
      const matchesLowStock = !this.lowStockFilter || 
        product.stock <= product.minStock;
      
      return matchesSearch && matchesCategory && matchesLowStock;
    });
    
    this.calculateStats();
  }

  calculateStats(): void {
    this.stats.totalProducts = this.products.length;
    this.stats.lowStockCount = this.products.filter(p => p.stock <= p.minStock).length;
    this.stats.outOfStockCount = this.products.filter(p => p.stock === 0).length;
    this.stats.totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.isEditing = true;
  }

  addProduct(): void {
    const newId = Math.max(...this.products.map(p => p.id)) + 1;
    
    const product: Product = {
      id: newId,
      name: this.newProduct.name || 'Nuevo Producto',
      description: this.newProduct.description || '',
      price: this.newProduct.price || 0,
      stock: this.newProduct.stock || 0,
      minStock: this.newProduct.minStock || 10,
      category: this.newProduct.category || 'General',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(product);
    this.applyFilters();
    this.resetForm();
    
    this.toastr.success('Producto agregado exitosamente');
  }

  updateProduct(): void {
    if (!this.selectedProduct) return;

    const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
    
    if (index !== -1) {
      const oldStock = this.products[index].stock;
      const newStock = this.selectedProduct.stock;
      
      this.products[index] = {
        ...this.selectedProduct,
        updatedAt: new Date()
      };

      // Notificar a los observadores si el stock bajó del mínimo
      if (newStock <= this.selectedProduct.minStock && newStock < oldStock) {
        this.inventorySubject.notify(
          this.selectedProduct.id,
          this.selectedProduct.name,
          newStock,
          this.selectedProduct.minStock
        );
        this.toastr.warning(`¡Alerta! Stock bajo para ${this.selectedProduct.name}`);
      }

      this.applyFilters();
      this.resetForm();
      this.toastr.success('Producto actualizado exitosamente');
    }
  }

  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.applyFilters();
      this.toastr.info('Producto eliminado');
    }
  }

  updateStock(productId: number, newStock: number): void {
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      const oldStock = product.stock;
      product.stock = newStock;
      product.updatedAt = new Date();

      // Notificar a los observadores si el stock bajó del mínimo
      if (newStock <= product.minStock && newStock < oldStock) {
        this.inventorySubject.notify(
          product.id,
          product.name,
          newStock,
          product.minStock
        );
        this.toastr.warning(`¡Alerta! Stock bajo para ${product.name}`);
      }

      this.applyFilters();
      this.toastr.success('Stock actualizado');
    }
  }

  resetForm(): void {
    this.selectedProduct = null;
    this.isEditing = false;
    this.newProduct = {};
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
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
}