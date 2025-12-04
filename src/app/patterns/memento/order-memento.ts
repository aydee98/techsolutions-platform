import { Order } from '../../interfaces/order.interface';

export class OrderMemento {
  constructor(
    public readonly orderId: number,
    public readonly state: Order,
    public readonly timestamp: Date,
    public readonly description: string
  ) {}

  getState(): Order {
    return JSON.parse(JSON.stringify(this.state));
  }

  getSummary(): string {
    return `[${this.timestamp.toLocaleTimeString()}] ${this.description}`;
  }
}