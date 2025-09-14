import { Injectable } from '@angular/core';
import { Sale } from './pos.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  printReceipt(sale: Sale, businessInfo?: any) {
    const receiptContent = this.generateReceiptHTML(sale, businessInfo);
    
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private generateReceiptHTML(sale: Sale, businessInfo?: any): string {
    const date = new Date(sale.date_time || new Date()).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo de Venta</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 280px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .business-name { font-size: 16px; font-weight: bold; }
          .item { display: flex; justify-content: space-between; margin: 2px 0; }
          .total-section { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
          .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-name">${businessInfo?.name || 'BARBERSHOP POS'}</div>
          <div>${businessInfo?.address || 'Dirección del negocio'}</div>
          <div>${businessInfo?.phone || 'Teléfono'}</div>
          <div>Fecha: ${date}</div>
          <div>Recibo #: ${sale.id || 'TEMP'}</div>
        </div>
        
        <div class="items">
          ${sale.details?.map(item => `
            <div class="item">
              <span>${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div style="font-size: 10px; color: #666;">
              ${item.quantity} x $${item.price.toFixed(2)}
            </div>
          `).join('') || ''}
        </div>
        
        <div class="total-section">
          <div class="item">
            <span>Subtotal:</span>
            <span>$${((sale.total || 0) + (sale.discount || 0)).toFixed(2)}</span>
          </div>
          ${sale.discount ? `
            <div class="item">
              <span>Descuento:</span>
              <span>-$${sale.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${(sale.total || 0).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Pagado:</span>
            <span>$${(sale.paid || 0).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Cambio:</span>
            <span>$${((sale.paid || 0) - (sale.total || 0)).toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Método:</span>
            <span>${this.getPaymentMethodLabel(sale.payment_method || 'cash')}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>¡Gracias por su compra!</div>
          <div>Vuelva pronto</div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentMethodLabel(method: string): string {
    const methods: {[key: string]: string} = {
      'cash': 'Efectivo',
      'credit_card': 'Tarjeta Crédito',
      'debit_card': 'Tarjeta Débito',
      'transfer': 'Transferencia'
    };
    return methods[method] || method;
  }

  printCashRegisterReport(register: any, denominations: any[]) {
    const reportContent = this.generateCashReportHTML(register, denominations);
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private generateCashReportHTML(register: any, denominations: any[]): string {
    const openDate = new Date(register.opened_at).toLocaleString();
    const closeDate = register.closed_at ? new Date(register.closed_at).toLocaleString() : 'En curso';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Caja</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin: 15px 0; }
          .denomination { display: flex; justify-content: space-between; padding: 2px 0; }
          .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>REPORTE DE CAJA</h2>
          <div>Apertura: ${openDate}</div>
          <div>Cierre: ${closeDate}</div>
        </div>
        
        <div class="section">
          <h3>Resumen</h3>
          <div>Fondo inicial: $${register.opening_amount.toFixed(2)}</div>
          <div>Ventas del día: $${register.total_sales.toFixed(2)}</div>
          <div>Total esperado: $${(register.opening_amount + register.total_sales).toFixed(2)}</div>
          ${register.closing_amount ? `<div>Total contado: $${register.closing_amount.toFixed(2)}</div>` : ''}
        </div>
        
        <div class="section">
          <h3>Denominaciones</h3>
          ${denominations.map(d => `
            <div class="denomination">
              <span>$${d.value.toFixed(2)} x ${d.count}</span>
              <span>$${d.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="denomination total">
            <span>TOTAL CONTADO:</span>
            <span>$${denominations.reduce((sum, d) => sum + d.total, 0).toFixed(2)}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}