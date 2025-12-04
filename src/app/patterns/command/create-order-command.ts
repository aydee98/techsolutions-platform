import { Order } from '../../interfaces/order.interface';
import { Command } from './command-invoker.service';

export class CreateOrderCommand implements Command {
  constructor(
    private orders: Order[],
    private order: Order,
    private onExecute?: () => void,
    private onUndo?: () => void
  ) {}

  execute(): void {
    this.orders.push(this.order);
    if (this.onExecute) this.onExecute();
  }

  undo(): void {
    const index = this.orders.findIndex(o => o.id === this.order.id);
    if (index !== -1) {
      this.orders.splice(index, 1);
    }
    if (this.onUndo) this.onUndo();
  }

  get description(): string {
    return `Crear pedido #${this.order.id} para ${this.order.customerName}`;
  }
}