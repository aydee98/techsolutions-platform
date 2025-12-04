import { PricingStrategy } from './pricing-strategy.interface';

export class DynamicPriceStrategy implements PricingStrategy {
  constructor(
    private demandMultiplier: number = 1.0,
    private seasonMultiplier: number = 1.0,
    private timeOfDayMultiplier: number = 1.0
  ) {}

  calculatePrice(basePrice: number): number {
    const hour = new Date().getHours();
    
    // Ajustar multiplicador por hora del día
    let timeMultiplier = this.timeOfDayMultiplier;
    if (hour >= 9 && hour <= 17) {
      timeMultiplier = 1.05; // +5% en horario laboral
    } else if (hour >= 18 && hour <= 22) {
      timeMultiplier = 1.1; // +10% en horario pico
    }

    return basePrice * this.demandMultiplier * this.seasonMultiplier * timeMultiplier;
  }

  getName(): string {
    return 'Precio Dinámico';
  }

  getDescription(): string {
    return `Precio ajustado por demanda (${this.demandMultiplier}x), temporada (${this.seasonMultiplier}x) y hora del día`;
  }

  getConfiguration(): any {
    return {
      type: 'dynamic',
      demandMultiplier: this.demandMultiplier,
      seasonMultiplier: this.seasonMultiplier,
      finalMultiplier: this.demandMultiplier * this.seasonMultiplier
    };
  }

  setDemandMultiplier(multiplier: number): void {
    this.demandMultiplier = multiplier;
  }

  setSeasonMultiplier(multiplier: number): void {
    this.seasonMultiplier = multiplier;
  }
}