import { Order } from '../../interfaces/order.interface';
import { Command } from './command-invoker.service';

export class UpdateStatusCommand implements Command {
  private oldStatus: string;

  constructor(
    private order: Order,
    private newStatus: string,
    private onExecute?: () => void,
    private onUndo?: () => void
  ) {
    this.oldStatus = order.status;
  }

  execute(): void {
    this.order.status = this.newStatus;
    this.order.updatedAt = new Date();
    if (this.onExecute) this.onExecute();
  }

  undo(): void {
    this.order.status = this.oldStatus;
    this.order.updatedAt = new Date();
    if (this.onUndo) this.onUndo();
  }

  get description(): string {
    return `Cambiar estado del pedido #${this.order.id} de "${this.oldStatus}" a "${this.newStatus}"`;
  }
}