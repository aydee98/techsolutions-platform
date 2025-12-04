import { Order } from '../../interfaces/order.interface';
import { Command } from './command-invoker.service';

export class ApplyDiscountCommand implements Command {
  private oldTotal: number;
  private oldDiscount: number;

  constructor(
    private order: Order,
    private discountPercentage: number,
    private onExecute?: () => void,
    private onUndo?: () => void
  ) {
    this.oldTotal = order.total;
    this.oldDiscount = order.discount || 0;
  }

  execute(): void {
    const discountAmount = this.order.subtotal * (this.discountPercentage / 100);
    this.order.discount = discountAmount;
    this.order.total = this.order.subtotal - discountAmount;
    this.order.updatedAt = new Date();
    if (this.onExecute) this.onExecute();
  }

  undo(): void {
    this.order.discount = this.oldDiscount;
    this.order.total = this.oldTotal;
    this.order.updatedAt = new Date();
    if (this.onUndo) this.onUndo();
  }

  get description(): string {
    return `Aplicar ${this.discountPercentage}% de descuento al pedido #${this.order.id}`;
  }
}