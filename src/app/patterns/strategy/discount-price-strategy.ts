import { PricingStrategy } from './pricing-strategy.interface';

export class DiscountPriceStrategy implements PricingStrategy {
  constructor(private discountPercentage: number = 10) {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
    }
  }

  calculatePrice(basePrice: number): number {
    const discountAmount = basePrice * (this.discountPercentage / 100);
    return basePrice - discountAmount;
  }

  getName(): string {
    return `Descuento del ${this.discountPercentage}%`;
  }

  getDescription(): string {
    return `Aplica un descuento del ${this.discountPercentage}% sobre el precio base`;
  }

  getConfiguration(): any {
    return { 
      type: 'discount', 
      percentage: this.discountPercentage,
      multiplier: 1 - (this.discountPercentage / 100)
    };
  }

  setDiscountPercentage(percentage: number): void {
    if (percentage >= 0 && percentage <= 100) {
      this.discountPercentage = percentage;
    }
  }

  getDiscountPercentage(): number {
    return this.discountPercentage;
  }
}