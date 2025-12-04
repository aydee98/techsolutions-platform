import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Order, OrderItem } from '../../interfaces/order.interface';
import { Product } from '../../interfaces/product.interface';
import { CommandInvokerService } from '../../patterns/command/command-invoker.service';
import { OrderCaretakerService } from '../../patterns/memento/order-caretaker.service';
import { PricingContextService } from '../../patterns/strategy/pricing-context.service';
import { StandardPriceStrategy } from '../../patterns/strategy/standard-price-strategy';
import { DiscountPriceStrategy } from '../../patterns/strategy/discount-price-strategy';
import { DynamicPriceStrategy } from '../../patterns/strategy/dynamic-price-strategy';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  filteredOrders: Order[] = [];
  
  // Nueva orden
  newOrder: Partial<Order> = {
    customerName: '',
    customerEmail: '',
    products: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    status: 'Pending'
  };
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  dateRange = {
    start: '',
    end: ''
  };
  
  // Producto para agregar
  selectedProduct: Product | null = null;
  productQuantity = 1;
  
  // Estrategias de precio
  pricingStrategies = [
    { id: 'standard', name: 'Precio Estándar' },
    { id: 'discount', name: 'Descuento Porcentual' },
    { id: 'dynamic', name: 'Precio Dinámico' }
  ];
  selectedStrategy = 'standard';
  discountPercentage = 10;
  
  // Estadísticas
  stats = {
    totalOrders: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  };

  constructor(
    private commandInvoker: CommandInvokerService,
    private orderCaretaker: OrderCaretakerService,
    private pricingContext: PricingContextService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSampleData();
    this.applyFilters();
    this.setupPricingStrategy();
  }

  private loadSampleData(): void {
    // Productos de muestra
    this.products = [
      { id: 1, name: 'Laptop HP Pavilion', price: 2500, stock: 15, minStock: 10, description: '', category: 'Electrónicos', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Mouse Logitech', price: 89, stock: 50, minStock: 20, description: '', category: 'Accesorios', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Teclado Mecánico', price: 320, stock: 25, minStock: 15, description: '', category: 'Accesorios', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Monitor 24"', price: 850, stock: 8, minStock: 10, description: '', category: 'Electrónicos', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Impresora Epson', price: 1200, stock: 3, minStock: 5, description: '', category: 'Oficina', createdAt: new Date(), updatedAt: new Date() }
    ];

    // Órdenes de muestra
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
      },
      {
        id: 1002,
        customerName: 'María García',
        customerEmail: 'maria@tienda.com',
        products: [
          { productId: 3, productName: 'Teclado Mecánico', quantity: 3, unitPrice: 320, total: 960 }
        ],
        subtotal: 960,
        discount: 0,
        total: 960,
        status: 'Processing',
        paymentMethod: 'Yape',
        paymentStatus: 'Pending',
        shippingAddress: 'Calle Los Pinos 456',
        createdAt: new Date('2024-03-22'),
        updatedAt: new Date('2024-03-22')
      },
      {
        id: 1003,
        customerName: 'Carlos López',
        customerEmail: 'carlos@negocio.com',
        products: [
          { productId: 4, productName: 'Monitor 24"', quantity: 1, unitPrice: 850, total: 850 },
          { productId: 5, productName: 'Impresora Epson', quantity: 1, unitPrice: 1200, total: 1200 }
        ],
        subtotal: 2050,
        discount: 205,
        total: 1845,
        status: 'Pending',
        paymentMethod: 'Plin',
        paymentStatus: 'Pending',
        shippingAddress: 'Jr. Unión 789',
        createdAt: new Date('2024-03-25'),
        updatedAt: new Date('2024-03-25')
      }
    ];

    this.calculateStats();
  }

  private setupPricingStrategy(): void {
    this.onStrategyChange();
  }

  onStrategyChange(): void {
    switch (this.selectedStrategy) {
      case 'standard':
        this.pricingContext.setStrategy(new StandardPriceStrategy());
        break;
      case 'discount':
        this.pricingContext.setStrategy(new DiscountPriceStrategy(this.discountPercentage));
        break;
      case 'dynamic':
        // Simulación de factores dinámicos
        const demandMultiplier = 1.1; // +10% por alta demanda
        const seasonMultiplier = 1.05; // +5% por temporada
        this.pricingContext.setStrategy(new DynamicPriceStrategy(demandMultiplier, seasonMultiplier));
        break;
    }
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Filtro por búsqueda
      const matchesSearch = !this.searchTerm || 
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toString().includes(this.searchTerm);
      
      // Filtro por estado
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      // Filtro por fecha
      let matchesDate = true;
      if (this.dateRange.start) {
        const startDate = new Date(this.dateRange.start);
        matchesDate = matchesDate && order.createdAt >= startDate;
      }
      if (this.dateRange.end) {
        const endDate = new Date(this.dateRange.end);
        matchesDate = matchesDate && order.createdAt <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    this.calculateStats();
  }

  calculateStats(): void {
    this.stats.totalOrders = this.orders.length;
    this.stats.pending = this.orders.filter(o => o.status === 'Pending').length;
    this.stats.processing = this.orders.filter(o => o.status === 'Processing').length;
    this.stats.completed = this.orders.filter(o => o.status === 'Completed').length;
    this.stats.cancelled = this.orders.filter(o => o.status === 'Cancelled').length;
    this.stats.totalRevenue = this.orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + o.total, 0);
  }

  addProductToOrder(): void {
    if (!this.selectedProduct || this.productQuantity <= 0) {
      this.toastr.warning('Selecciona un producto y cantidad válida');
      return;
    }

    if (this.productQuantity > this.selectedProduct.stock) {
      this.toastr.error(`Stock insuficiente. Disponible: ${this.selectedProduct.stock}`);
      return;
    }

    const existingItem = this.newOrder.products?.find(
      item => item.productId === this.selectedProduct!.id
    );

    if (existingItem) {
      existingItem.quantity += this.productQuantity;
      existingItem.total = existingItem.quantity * existingItem.unitPrice;
    } else {
      const orderItem: OrderItem = {
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        quantity: this.productQuantity,
        unitPrice: this.selectedProduct.price,
        total: this.selectedProduct.price * this.productQuantity
      };
      this.newOrder.products?.push(orderItem);
    }

    this.calculateOrderTotals();
    this.productQuantity = 1;
    this.toastr.success('Producto agregado al pedido');
  }

  removeProductFromOrder(index: number): void {
    this.newOrder.products?.splice(index, 1);
    this.calculateOrderTotals();
    this.toastr.info('Producto removido del pedido');
  }

  calculateOrderTotals(): void {
    if (!this.newOrder.products) return;

    this.newOrder.subtotal = this.newOrder.products.reduce(
      (sum, item) => sum + item.total, 0
    );

    // Aplicar estrategia de precios
    this.newOrder.total = this.pricingContext.calculatePrice(this.newOrder.subtotal);
    this.newOrder.discount = this.newOrder.subtotal - this.newOrder.total;
  }

  createOrder(): void {
    if (!this.newOrder.customerName || !this.newOrder.customerEmail) {
      this.toastr.warning('Completa los datos del cliente');
      return;
    }

    if (!this.newOrder.products || this.newOrder.products.length === 0) {
      this.toastr.warning('Agrega productos al pedido');
      return;
    }

    const newId = Math.max(...this.orders.map(o => o.id)) + 1;
    
    const order: Order = {
      id: newId,
      customerName: this.newOrder.customerName || '',
      customerEmail: this.newOrder.customerEmail || '',
      products: [...(this.newOrder.products || [])],
      subtotal: this.newOrder.subtotal || 0,
      discount: this.newOrder.discount || 0,
      total: this.newOrder.total || 0,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ejecutar comando de creación
    this.commandInvoker.executeCommand({
      execute: () => {
        this.orders.unshift(order);
        this.orderCaretaker.saveState(order);
        this.applyFilters();
        this.resetOrderForm();
        this.toastr.success(`Pedido #${order.id} creado exitosamente`);
      },
      undo: () => {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders.splice(index, 1);
          this.applyFilters();
          this.toastr.info(`Pedido #${order.id} deshecho`);
        }
      },
      description: `Crear pedido #${order.id}`
    });
  }

  updateOrderStatus(orderId: number, newStatus: Order['status']): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    
    this.commandInvoker.executeCommand({
      execute: () => {
        order.status = newStatus;
        order.updatedAt = new Date();
        this.applyFilters();
        this.toastr.success(`Pedido #${orderId} actualizado a "${newStatus}"`);
      },
      undo: () => {
        order.status = oldStatus;
        order.updatedAt = new Date();
        this.applyFilters();
        this.toastr.info(`Estado del pedido #${orderId} restaurado`);
      },
      description: `Cambiar estado del pedido #${orderId} de "${oldStatus}" a "${newStatus}"`
    });
  }

  cancelOrder(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    
    this.commandInvoker.executeCommand({
      execute: () => {
        order.status = 'Cancelled';
        order.updatedAt = new Date();
        this.applyFilters();
        this.toastr.warning(`Pedido #${orderId} cancelado`);
      },
      undo: () => {
        order.status = oldStatus;
        order.updatedAt = new Date();
        this.applyFilters();
        this.toastr.info(`Cancelación del pedido #${orderId} deshecha`);
      },
      description: `Cancelar pedido #${orderId}`
    });
  }

  applyDiscountToOrder(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const oldTotal = order.total;
    const oldDiscount = order.discount;
    
    this.commandInvoker.executeCommand({
      execute: () => {
        order.discount = order.subtotal * 0.1; // 10% de descuento
        order.total = order.subtotal - order.discount;
        order.updatedAt = new Date();
        this.toastr.success(`Descuento aplicado al pedido #${orderId}`);
      },
      undo: () => {
        order.discount = oldDiscount;
        order.total = oldTotal;
        order.updatedAt = new Date();
        this.toastr.info(`Descuento removido del pedido #${orderId}`);
      },
      description: `Aplicar 10% de descuento al pedido #${orderId}`
    });
  }

  undoLastAction(): void {
    this.commandInvoker.undo();
    this.applyFilters();
  }

  redoLastAction(): void {
    this.commandInvoker.redo();
    this.applyFilters();
  }

  viewOrderHistory(orderId: number): void {
    const history = this.orderCaretaker.getHistory(orderId);
    if (history.length > 0) {
      const historyText = history.map((memento, index) => 
        `Versión ${index + 1}: ${memento.timestamp.toLocaleString()} - ${JSON.stringify(memento.state.status)}`
      ).join('\n');
      
      this.toastr.info(
        `Historial del pedido #${orderId}:\n${historyText}`,
        'Historial de Estados',
        { timeOut: 10000 }
      );
    } else {
      this.toastr.info('No hay historial disponible para este pedido');
    }
  }

  restoreOrderState(orderId: number, stateIndex: number): void {
    const restoredState = this.orderCaretaker.restoreState(orderId, stateIndex);
    if (restoredState) {
      const index = this.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        this.orders[index] = restoredState;
        this.applyFilters();
        this.toastr.success(`Pedido #${orderId} restaurado a estado anterior`);
      }
    }
  }

  resetOrderForm(): void {
    this.newOrder = {
      customerName: '',
      customerEmail: '',
      products: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      status: 'Pending'
    };
    this.selectedProduct = null;
    this.productQuantity = 1;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Processing': return 'processing';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      default: return '';
    }
  }

  getStatusName(status: string): string {
    const names: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Processing': 'Procesando',
      'Completed': 'Completado',
      'Cancelled': 'Cancelado'
    };
    return names[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'Paid': return 'paid';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      case 'Refunded': return 'refunded';
      default: return '';
    }
  }

  getTotalProducts(order: Order): number {
    return order.products.reduce((sum, item) => sum + item.quantity, 0);
  }
}