import { PricingStrategy } from './pricing-strategy.interface';

export class StandardPriceStrategy implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice;
  }

  getName(): string {
    return 'Precio Estándar';
  }

  getDescription(): string {
    return 'Precio base sin modificaciones';
  }

  getConfiguration(): any {
    return { type: 'standard', multiplier: 1 };
  }
}