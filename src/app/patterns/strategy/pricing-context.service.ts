import { Injectable } from '@angular/core';
import { PricingStrategy } from './pricing-strategy.interface';
import { StandardPriceStrategy } from './standard-price-strategy';
import { DiscountPriceStrategy } from './discount-price-strategy';
import { DynamicPriceStrategy } from './dynamic-price-strategy';

@Injectable({
  providedIn: 'root'
})
export class PricingContextService {
  private strategy: PricingStrategy = new StandardPriceStrategy();
  private strategyHistory: PricingStrategy[] = [];
  private availableStrategies: Map<string, PricingStrategy> = new Map();

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.availableStrategies.set('standard', new StandardPriceStrategy());
    this.availableStrategies.set('discount_10', new DiscountPriceStrategy(10));
    this.availableStrategies.set('discount_20', new DiscountPriceStrategy(20));
    this.availableStrategies.set('dynamic', new DynamicPriceStrategy(1.1, 1.05));
  }

  setStrategy(strategy: PricingStrategy): void {
    this.strategyHistory.push(this.strategy);
    
    // Limitar historial
    if (this.strategyHistory.length > 10) {
      this.strategyHistory.shift();
    }

    this.strategy = strategy;
    console.log(`🎯 Estrategia cambiada a: ${strategy.getName()}`);
  }

  setStrategyByName(strategyName: string, config?: any): void {
    let strategy: PricingStrategy;

    switch (strategyName) {
      case 'standard':
        strategy = new StandardPriceStrategy();
        break;
      case 'discount':
        const percentage = config?.percentage || 10;
        strategy = new DiscountPriceStrategy(percentage);
        break;
      case 'dynamic':
        const demand = config?.demandMultiplier || 1.0;
        const season = config?.seasonMultiplier || 1.0;
        strategy = new DynamicPriceStrategy(demand, season);
        break;
      default:
        strategy = new StandardPriceStrategy();
    }

    this.setStrategy(strategy);
  }

  calculatePrice(basePrice: number): number {
    const finalPrice = this.strategy.calculatePrice(basePrice);
    
    console.log(`💰 Cálculo de precio: ${basePrice} → ${finalPrice} (${this.strategy.getName()})`);
    
    return Number(finalPrice.toFixed(2));
  }

  getCurrentStrategy(): PricingStrategy {
    return this.strategy;
  }

  getCurrentStrategyName(): string {
    return this.strategy.getName();
  }

  getCurrentStrategyDescription(): string {
    return this.strategy.getDescription();
  }

  getAvailableStrategies(): Map<string, PricingStrategy> {
    return new Map(this.availableStrategies);
  }

  getStrategyHistory(): PricingStrategy[] {
    return [...this.strategyHistory];
  }

  revertToPreviousStrategy(): boolean {
    if (this.strategyHistory.length === 0) {
      return false;
    }

    const previousStrategy = this.strategyHistory.pop()!;
    this.strategy = previousStrategy;
    
    console.log(`↩️ Estrategia revertida a: ${previousStrategy.getName()}`);
    
    return true;
  }

  createCustomDiscountStrategy(percentage: number): DiscountPriceStrategy {
    return new DiscountPriceStrategy(percentage);
  }

  createCustomDynamicStrategy(demandMultiplier: number, seasonMultiplier: number): DynamicPriceStrategy {
    return new DynamicPriceStrategy(demandMultiplier, seasonMultiplier);
  }
}