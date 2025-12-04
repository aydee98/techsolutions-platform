// src/app/components/payments/payments.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Payment } from '../../interfaces/payment.interface';
import { Order } from '../../interfaces/order.interface';
import { PaymentFacadeService } from '../../patterns/adapter/payment-facade.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  // Listas de datos
  payments: Payment[] = [];
  orders: Order[] = [];
  
  // Filtros
  searchTerm = '';
  gatewayFilter = '';
  statusFilter = '';
  dateRange = {
    start: '',
    end: ''
  };
  
  // Nuevo pago
  newPayment: Partial<Payment> = {
    orderId: 0,
    amount: 0,
    gateway: 'PAYPAL',
    currency: 'USD'
  };
  
  // Pasarelas disponibles
  availableGateways = [
    { id: 'PAYPAL', name: 'PayPal', icon: '💳', color: '#003087' },
    { id: 'YAPE', name: 'Yape', icon: '📱', color: '#FF6B00' },
    { id: 'PLIN', name: 'Plin', icon: '📲', color: '#00B2A9' },
    { id: 'CARD', name: 'Tarjeta', icon: '💎', color: '#28a745' }
  ];
  
  // Estadísticas
  stats = {
    totalPayments: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    successRate: 0
  };
  
  // Configuración de pasarelas
  gatewaySettings: { [key: string]: boolean } = {
    PAYPAL: true,
    YAPE: true,
    PLIN: true,
    CARD: true
  };
  
  // Para simulación de datos
  demoOrders = [
    { id: 1001, customer: 'Juan Pérez', amount: 2410.20 },
    { id: 1002, customer: 'María García', amount: 960.00 },
    { id: 1003, customer: 'Carlos López', amount: 1845.00 },
    { id: 1004, customer: 'Ana Torres', amount: 750.50 },
    { id: 1005, customer: 'Pedro Sánchez', amount: 1200.00 }
  ];
  
  // Estado del pago
  processingPayment = false;
  selectedPayment: Payment | null = null;
  transactionDetails: any = null;

  constructor(
    private paymentFacade: PaymentFacadeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSampleData();
    this.applyFilters();
    this.loadGatewaySettings();
  }

  private loadSampleData(): void {
    // Pagos de muestra
    this.payments = [
      {
        id: 1,
        orderId: 1001,
        amount: 2410.20,
        gateway: 'PAYPAL',
        status: 'Completed',
        transactionId: 'PAYPAL_123456789',
        currency: 'USD',
        date: '2024-03-21T10:30:00',
        processingFee: 0,
        netAmount: 0
      },
      {
        id: 2,
        orderId: 1002,
        amount: 960.00,
        gateway: 'YAPE',
        status: 'Completed',
        transactionId: 'YAPE_987654321',
        currency: 'PEN',
        date: '2024-03-22T14:15:00',
        processingFee: 0,
        netAmount: 0
      },
      {
        id: 3,
        orderId: 1003,
        amount: 1845.00,
        gateway: 'PLIN',
        status: 'Pending',
        transactionId: 'PLIN_555555555',
        currency: 'PEN',
        date: '2024-03-25T09:45:00',
        processingFee: 0,
        netAmount: 0
      },
      {
        id: 4,
        orderId: 1004,
        amount: 750.50,
        gateway: 'PAYPAL',
        status: 'Failed',
        transactionId: 'PAYPAL_111222333',
        currency: 'USD',
        date: '2024-03-24T16:20:00',
        processingFee: 0,
        netAmount: 0
      },
      {
        id: 5,
        orderId: 1005,
        amount: 1200.00,
        gateway: 'YAPE',
        status: 'Refunded',
        transactionId: 'YAPE_444555666',
        currency: 'PEN',
        date: '2024-03-23T11:10:00',
        processingFee: 0,
        netAmount: 0
      }
    ];

    // Calcular processingFee y netAmount para cada pago
    this.payments.forEach(payment => {
      payment.processingFee = this.calculateProcessingFee(payment);
      payment.netAmount = this.calculateNetAmount(payment);
    });

    this.calculateStats();
  }

  private loadGatewaySettings(): void {
    // Cargar configuración de pasarelas
    const settings = localStorage.getItem('paymentGatewaySettings');
    if (settings) {
      this.gatewaySettings = JSON.parse(settings);
    }
  }

  private saveGatewaySettings(): void {
    localStorage.setItem('paymentGatewaySettings', JSON.stringify(this.gatewaySettings));
  }

  applyFilters(): void {
    this.calculateStats();
  }

  calculateStats(): void {
    this.stats.totalPayments = this.payments.length;
    this.stats.completed = this.payments.filter(p => p.status === 'Completed').length;
    this.stats.pending = this.payments.filter(p => p.status === 'Pending').length;
    this.stats.failed = this.payments.filter(p => p.status === 'Failed').length;
    this.stats.refunded = this.payments.filter(p => p.status === 'Refunded').length;
    
    this.stats.totalAmount = this.payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    this.stats.successRate = this.stats.totalPayments > 0 
      ? Math.round((this.stats.completed / this.stats.totalPayments) * 100) 
      : 0;
  }

  selectOrder(order: any): void {
    this.newPayment.orderId = order.id;
    this.newPayment.amount = order.amount;
    this.toastr.info(`Orden #${order.id} seleccionada`);
  }

  async processPayment(): Promise<void> {
    if (!this.newPayment.orderId || !this.newPayment.amount || this.newPayment.amount <= 0) {
      this.toastr.warning('Completa todos los campos del pago');
      return;
    }

    if (!this.gatewaySettings[this.newPayment.gateway || '']) {
      this.toastr.error(`La pasarela ${this.newPayment.gateway} está deshabilitada`);
      return;
    }

    this.processingPayment = true;

    try {
      // Crear objeto Payment completo para el procesamiento
      const paymentData: Payment = {
        id: Math.max(...this.payments.map(p => p.id)) + 1,
        orderId: this.newPayment.orderId!,
        amount: this.newPayment.amount!,
        gateway: this.newPayment.gateway!,
        status: 'Pending',
        transactionId: '',
        currency: this.newPayment.currency || 'USD',
        date: new Date().toISOString(),
        processingFee: 0,
        netAmount: 0
      };

      // Calcular comisión y monto neto
      paymentData.processingFee = this.calculateProcessingFee(paymentData);
      paymentData.netAmount = this.calculateNetAmount(paymentData);

      // Usar el PaymentFacade (Adapter Pattern)
      const result = await this.paymentFacade.processPayment(
        paymentData.gateway,
        paymentData.amount,
        paymentData.orderId,
        { currency: paymentData.currency }
      );

      if (result.success) {
        // Actualizar datos del pago con resultado
        paymentData.transactionId = result.transactionId || `TX_${Date.now()}`;
        paymentData.status = 'Completed';

        this.payments.unshift(paymentData);
        this.applyFilters();
        this.resetPaymentForm();
        
        this.toastr.success(
          `Pago procesado exitosamente via ${paymentData.gateway}`,
          '✅ Pago Completado'
        );

        // Simular actualización de orden
        this.updateOrderStatus(paymentData.orderId, 'Paid');
      } else {
        // Para propósitos de demo, marcar como fallido pero agregar
        paymentData.status = 'Failed';
        paymentData.transactionId = `FAILED_${Date.now()}`;
        this.payments.unshift(paymentData);
        this.applyFilters();
        
        this.toastr.error(result.error || 'Error en el procesamiento del pago', '❌ Error');
      }
    } catch (error) {
      this.toastr.error('Error en la conexión con la pasarela', '❌ Error de Conexión');
      console.error('Payment error:', error);
    } finally {
      this.processingPayment = false;
    }
  }

  async refundPayment(paymentId: number): Promise<void> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return;

    if (payment.status !== 'Completed') {
      this.toastr.warning('Solo se pueden reembolsar pagos completados');
      return;
    }

    if (confirm(`¿Reembolsar pago #${payment.id} por ${payment.currency} ${payment.amount}?`)) {
      try {
        const result = await this.paymentFacade.refundPayment(
          payment.gateway,
          payment.transactionId!,
          payment.amount
        );

        if (result.success) {
          payment.status = 'Refunded';
          this.applyFilters();
          
          this.toastr.success(
            `Reembolso procesado exitosamente`,
            '💰 Reembolso Completado'
          );

          // Simular actualización de orden
          this.updateOrderStatus(payment.orderId, 'Refunded');
        } else {
          this.toastr.error('Error en el reembolso', '❌ Error');
        }
      } catch (error) {
        this.toastr.error('Error en la conexión', '❌ Error de Conexión');
      }
    }
  }

  async retryPayment(paymentId: number): Promise<void> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'Failed') return;

    if (confirm(`¿Reintentar pago #${payment.id}?`)) {
      payment.status = 'Pending';
      this.applyFilters();
      
      // Simular reintento exitoso después de 2 segundos
      setTimeout(() => {
        payment.status = 'Completed';
        this.applyFilters();
        this.toastr.success('Pago reintentado exitosamente', '✅ Reintento Exitoso');
      }, 2000);
    }
  }

  viewTransactionDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.transactionDetails = {
      gateway: payment.gateway,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      date: this.formatDate(payment.date),
      orderId: payment.orderId,
      processingFee: payment.processingFee,
      netAmount: payment.netAmount
    };
  }

  // MÉTODO PARA EL TEMPLATE
  closeModal(): void {
    this.selectedPayment = null;
    this.transactionDetails = null;
  }

  toggleGateway(gatewayId: string): void {
    this.gatewaySettings[gatewayId] = !this.gatewaySettings[gatewayId];
    this.saveGatewaySettings();
    
    const action = this.gatewaySettings[gatewayId] ? 'habilitada' : 'deshabilitada';
    this.toastr.info(`Pasarela ${gatewayId} ${action}`);
  }

  testGateway(gatewayId: string): void {
    this.toastr.info(`Probando conexión con ${gatewayId}...`, '🔍 Test de Conexión');
    
    // Simular test de conexión
    setTimeout(() => {
      this.toastr.success(`Conexión exitosa con ${gatewayId}`, '✅ Conexión OK');
    }, 1000);
  }

  getEnabledGateways(): string[] {
    return Object.entries(this.gatewaySettings)
      .filter(([_, enabled]) => enabled)
      .map(([gateway]) => gateway);
  }

  getGatewayIcon(gateway: string): string {
    const gatewayInfo = this.availableGateways.find(g => g.id === gateway);
    return gatewayInfo?.icon || '💳';
  }

  getGatewayColor(gateway: string): string {
    const gatewayInfo = this.availableGateways.find(g => g.id === gateway);
    return gatewayInfo?.color || '#007bff';
  }

  getGatewayName(gateway: string): string {
    const gatewayInfo = this.availableGateways.find(g => g.id === gateway);
    return gatewayInfo?.name || gateway;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      case 'Refunded': return 'refunded';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed': return '✅';
      case 'Pending': return '⏳';
      case 'Failed': return '❌';
      case 'Refunded': return '💰';
      default: return '❓';
    }
  }

  calculateProcessingFee(payment: Payment): number {
    const fees: { [key: string]: number } = {
      'PAYPAL': 0.029, // 2.9%
      'YAPE': 0.01,    // 1%
      'PLIN': 0.015,   // 1.5%
      'CARD': 0.025    // 2.5%
    };
    
    const feeRate = fees[payment.gateway] || 0.02;
    return Number((payment.amount * feeRate).toFixed(2));
  }

  calculateNetAmount(payment: Payment): number {
    const fee = this.calculateProcessingFee(payment);
    return Number((payment.amount - fee).toFixed(2));
  }

  // MÉTODOS PARA EL TEMPLATE
  getProcessingFee(): number {
    if (!this.newPayment || !this.newPayment.gateway || !this.newPayment.amount) return 0;
    
    const payment: Payment = {
      id: 0,
      orderId: this.newPayment.orderId || 0,
      gateway: this.newPayment.gateway,
      amount: this.newPayment.amount,
      currency: this.newPayment.currency || 'USD',
      status: 'Pending',
      transactionId: '',
      date: new Date().toISOString(),
      processingFee: 0,
      netAmount: 0
    };
    
    return this.calculateProcessingFee(payment);
  }

  getNetAmount(): number {
    if (!this.newPayment || !this.newPayment.gateway || !this.newPayment.amount) return 0;
    
    const payment: Payment = {
      id: 0,
      orderId: this.newPayment.orderId || 0,
      gateway: this.newPayment.gateway,
      amount: this.newPayment.amount,
      currency: this.newPayment.currency || 'USD',
      status: 'Pending',
      transactionId: '',
      date: new Date().toISOString(),
      processingFee: 0,
      netAmount: 0
    };
    
    return this.calculateNetAmount(payment);
  }

  getFormattedProcessingFee(): string {
    const fee = this.getProcessingFee();
    const currency = this.newPayment?.currency || 'USD';
    return this.formatAmount(fee, currency);
  }

  getFormattedNetAmount(): string {
    const amount = this.getNetAmount();
    const currency = this.newPayment?.currency || 'USD';
    return this.formatAmount(amount, currency);
  }

  private updateOrderStatus(orderId: number, status: string): void {
    console.log(`Orden #${orderId} actualizada a estado: ${status}`);
  }

  private resetPaymentForm(): void {
    this.newPayment = {
      orderId: 0,
      amount: 0,
      gateway: 'PAYPAL',
      currency: 'USD'
    };
    this.selectedPayment = null;
    this.transactionDetails = null;
  }

  getCurrencySymbol(currency: string): string {
    return currency === 'USD' ? '$' : 'S/';
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol} ${amount.toFixed(2)}`;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFilteredPayments(): Payment[] {
    return this.payments.filter(payment => {
      const matchesSearch = !this.searchTerm || 
        payment.transactionId?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payment.orderId.toString().includes(this.searchTerm);
      
      const matchesGateway = !this.gatewayFilter || payment.gateway === this.gatewayFilter;
      const matchesStatus = !this.statusFilter || payment.status === this.statusFilter;
      
      return matchesSearch && matchesGateway && matchesStatus;
    });
  }
}