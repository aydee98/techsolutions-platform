import { Injectable } from '@angular/core';
import { PaymentAdapter } from './payment-adapter.interface';
import { PaymentResult } from '../../interfaces/payment-result.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentFacadeService {
  private adapters: Map<string, PaymentAdapter> = new Map();
  private enabledGateways: Set<string> = new Set(['PAYPAL', 'YAPE', 'PLIN', 'CARD']);

  constructor() {
    this.registerAdapters();
  }

  private registerAdapters(): void {
    // Registrar adaptadores dinámicamente para evitar problemas de inyección
    try {
      // PAYPAL
      const paypalAdapter = this.createPaypalAdapter();
      this.adapters.set('PAYPAL', paypalAdapter);
      
      // YAPE
      const yapeAdapter = this.createYapeAdapter();
      this.adapters.set('YAPE', yapeAdapter);
      
      // PLIN
      const plinAdapter = this.createPlinAdapter();
      this.adapters.set('PLIN', plinAdapter);
      
      // CARD
      const cardAdapter = this.createCardAdapter();
      this.adapters.set('CARD', cardAdapter);
      
      console.log('🔄 Adaptadores de pago registrados:', Array.from(this.adapters.keys()));
    } catch (error) {
      console.error('❌ Error al registrar adaptadores:', error);
    }
  }

  // Métodos factory para crear adaptadores
  private createPaypalAdapter(): PaymentAdapter {
    return {
      processPayment: async (amount: number, orderId: number, metadata?: any): Promise<PaymentResult> => {
        await this.simulateDelay(1000);
        const success = Math.random() > 0.1; // 90% de éxito
        if (success) {
          return {
            success: true,
            transactionId: `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'COMPLETED',
            amount,
            currency: metadata?.currency || 'USD',
            timestamp: new Date()
          };
        }
        return {
          success: false,
          error: 'Error en autorización PayPal',
          timestamp: new Date()
        };
      },
      refundPayment: async (transactionId: string, amount?: number): Promise<PaymentResult> => {
        await this.simulateDelay(800);
        return {
          success: true,
          transactionId: `REFUND_${transactionId}`,
          status: 'REFUNDED',
          timestamp: new Date()
        };
      },
      getStatus: async (transactionId: string): Promise<PaymentResult> => {
        await this.simulateDelay(500);
        return {
          success: true,
          transactionId,
          status: 'COMPLETED',
          timestamp: new Date()
        };
      }
    };
  }

  private createYapeAdapter(): PaymentAdapter {
    return {
      processPayment: async (amount: number, orderId: number, metadata?: any): Promise<PaymentResult> => {
        await this.simulateDelay(800);
        const success = Math.random() > 0.05; // 95% de éxito
        if (success) {
          return {
            success: true,
            transactionId: `YAPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'COMPLETED',
            amount,
            currency: metadata?.currency || 'PEN',
            timestamp: new Date()
          };
        }
        return {
          success: false,
          error: 'QR expirado o fondos insuficientes',
          timestamp: new Date()
        };
      },
      refundPayment: async (transactionId: string, amount?: number): Promise<PaymentResult> => {
        await this.simulateDelay(700);
        return {
          success: true,
          transactionId: `REFUND_${transactionId}`,
          status: 'REFUNDED',
          timestamp: new Date()
        };
      },
      getStatus: async (transactionId: string): Promise<PaymentResult> => {
        await this.simulateDelay(400);
        return {
          success: true,
          transactionId,
          status: 'COMPLETED',
          timestamp: new Date()
        };
      }
    };
  }

  private createPlinAdapter(): PaymentAdapter {
    return {
      processPayment: async (amount: number, orderId: number, metadata?: any): Promise<PaymentResult> => {
        await this.simulateDelay(900);
        const success = Math.random() > 0.08; // 92% de éxito
        if (success) {
          return {
            success: true,
            transactionId: `PLIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'COMPLETED',
            amount,
            currency: metadata?.currency || 'PEN',
            timestamp: new Date()
          };
        }
        return {
          success: false,
          error: 'Error en transferencia PLIN',
          timestamp: new Date()
        };
      },
      refundPayment: async (transactionId: string, amount?: number): Promise<PaymentResult> => {
        await this.simulateDelay(750);
        return {
          success: true,
          transactionId: `REFUND_${transactionId}`,
          status: 'REFUNDED',
          timestamp: new Date()
        };
      },
      getStatus: async (transactionId: string): Promise<PaymentResult> => {
        await this.simulateDelay(450);
        return {
          success: true,
          transactionId,
          status: 'COMPLETED',
          timestamp: new Date()
        };
      }
    };
  }

  private createCardAdapter(): PaymentAdapter {
    return {
      processPayment: async (amount: number, orderId: number, metadata?: any): Promise<PaymentResult> => {
        await this.simulateDelay(1200);
        const success = Math.random() > 0.15; // 85% de éxito
        if (success) {
          return {
            success: true,
            transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'COMPLETED',
            amount,
            currency: metadata?.currency || 'USD',
            timestamp: new Date()
          };
        }
        return {
          success: false,
          error: 'Tarjeta rechazada o fondos insuficientes',
          timestamp: new Date()
        };
      },
      refundPayment: async (transactionId: string, amount?: number): Promise<PaymentResult> => {
        await this.simulateDelay(1000);
        return {
          success: true,
          transactionId: `REFUND_${transactionId}`,
          status: 'REFUNDED',
          timestamp: new Date()
        };
      },
      getStatus: async (transactionId: string): Promise<PaymentResult> => {
        await this.simulateDelay(600);
        return {
          success: true,
          transactionId,
          status: 'COMPLETED',
          timestamp: new Date()
        };
      }
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos públicos
  async processPayment(gateway: string, amount: number, orderId: number, metadata?: any): Promise<PaymentResult> {
    if (!this.isGatewayEnabled(gateway)) {
      return {
        success: false,
        error: `La pasarela ${gateway} está deshabilitada`,
        timestamp: new Date()
      };
    }

    const adapter = this.adapters.get(gateway.toUpperCase());
    if (!adapter) {
      return {
        success: false,
        error: `Pasarela ${gateway} no soportada`,
        timestamp: new Date()
      };
    }

    try {
      console.log(`🚀 Procesando pago via ${gateway} - Monto: ${amount} - Orden: ${orderId}`);
      const result = await adapter.processPayment(amount, orderId, metadata);
      
      if (result.success) {
        console.log(`✅ Pago exitoso via ${gateway} - ID: ${result.transactionId}`);
      } else {
        console.error(`❌ Error en pago via ${gateway}: ${result.error}`);
      }
      
      return result;
    } catch (error: any) {
      console.error(`🔥 Error en procesamiento ${gateway}:`, error);
      return {
        success: false,
        error: `Error en la conexión: ${error.message || error}`,
        timestamp: new Date()
      };
    }
  }

  async refundPayment(gateway: string, transactionId: string, amount?: number): Promise<PaymentResult> {
    const adapter = this.adapters.get(gateway.toUpperCase());
    if (!adapter) {
      return {
        success: false,
        error: `Pasarela ${gateway} no soportada`,
        timestamp: new Date()
      };
    }

    try {
      console.log(`💰 Procesando reembolso via ${gateway} - Transacción: ${transactionId}`);
      const result = await adapter.refundPayment(transactionId, amount);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Error en el reembolso: ${error.message || error}`,
        timestamp: new Date()
      };
    }
  }

  async getPaymentStatus(gateway: string, transactionId: string): Promise<PaymentResult> {
    const adapter = this.adapters.get(gateway.toUpperCase());
    if (!adapter) {
      return {
        success: false,
        error: `Pasarela ${gateway} no soportada`,
        timestamp: new Date()
      };
    }

    try {
      const result = await adapter.getStatus(transactionId);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Error al obtener estado: ${error.message || error}`,
        timestamp: new Date()
      };
    }
  }

  getAvailableGateways(): string[] {
    return Array.from(this.adapters.keys())
      .filter(gateway => this.enabledGateways.has(gateway));
  }

  enableGateway(gateway: string): void {
    this.enabledGateways.add(gateway.toUpperCase());
    console.log(`✅ Pasarela ${gateway} habilitada`);
  }

  disableGateway(gateway: string): void {
    this.enabledGateways.delete(gateway.toUpperCase());
    console.log(`❌ Pasarela ${gateway} deshabilitada`);
  }

  isGatewayEnabled(gateway: string): boolean {
    return this.enabledGateways.has(gateway.toUpperCase());
  }

  getGatewayStatus(gateway: string): { enabled: boolean; adapter: boolean } {
    return {
      enabled: this.isGatewayEnabled(gateway),
      adapter: this.adapters.has(gateway.toUpperCase())
    };
  }

  getAllGatewayStatus(): Map<string, { enabled: boolean; adapter: boolean }> {
    const status = new Map();
    this.adapters.forEach((_, gateway) => {
      status.set(gateway, this.getGatewayStatus(gateway));
    });
    return status;
  }

  getAdapterInfo(gateway: string): { name: string; description: string; icon: string; color: string } {
    const adapterInfo: { [key: string]: { name: string; description: string; icon: string; color: string } } = {
      PAYPAL: { 
        name: 'PayPal', 
        description: 'Procesador de pagos internacional', 
        icon: '💳', 
        color: '#003087' 
      },
      YAPE: { 
        name: 'Yape', 
        description: 'Pagos por QR móvil', 
        icon: '📱', 
        color: '#FF6B00' 
      },
      PLIN: { 
        name: 'Plin', 
        description: 'Pagos por transferencia inmediata', 
        icon: '📲', 
        color: '#00B2A9' 
      },
      CARD: { 
        name: 'Tarjeta', 
        description: 'Procesador de tarjetas local', 
        icon: '💎', 
        color: '#28a745' 
      }
    };

    return adapterInfo[gateway.toUpperCase()] || { 
      name: gateway, 
      description: 'Pasarela no identificada', 
      icon: '❓', 
      color: '#6c757d' 
    };
  }

  getGatewayFeeRate(gateway: string): number {
    const feeRates: { [key: string]: number } = {
      PAYPAL: 0.029, // 2.9%
      YAPE: 0.01,    // 1%
      PLIN: 0.015,   // 1.5%
      CARD: 0.025    // 2.5%
    };
    return feeRates[gateway.toUpperCase()] || 0.02;
  }

  calculateProcessingFee(gateway: string, amount: number): number {
    const feeRate = this.getGatewayFeeRate(gateway);
    return Number((amount * feeRate).toFixed(2));
  }

  calculateNetAmount(gateway: string, amount: number): number {
    const fee = this.calculateProcessingFee(gateway, amount);
    return Number((amount - fee).toFixed(2));
  }
}