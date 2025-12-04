export interface PricingStrategy {
  calculatePrice(basePrice: number): number;
  getName(): string;
  getDescription(): string;
  getConfiguration(): any;
}