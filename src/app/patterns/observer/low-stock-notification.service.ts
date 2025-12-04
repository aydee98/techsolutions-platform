import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { InventoryObserver } from './inventory-observer.interface';

@Injectable({
  providedIn: 'root'
})
export class LowStockNotificationService implements InventoryObserver {
  
  constructor(private toastr: ToastrService) {}
  
  update(productId: number, productName: string, currentStock: number, minStock: number): void {
    const message = `⚠️ Producto "${productName}" (ID: ${productId}) tiene stock bajo: ${currentStock}/${minStock}`;
    
    // Enviar notificación toast
    this.toastr.warning(message, 'Alerta de Stock Bajo', {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
    
    // En un sistema real, aquí podrías:
    // 1. Enviar email
    // 2. Enviar notificación push
    // 3. Registrar en base de datos
    // 4. Enviar mensaje a Slack/Teams
    
    console.log(`📧 [Notificación] ${message}`);
  }
}