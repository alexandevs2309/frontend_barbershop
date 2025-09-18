import { Injectable } from '@angular/core';
import { Sale, Payment } from './pos.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  printReceipt(sale: Sale, businessInfo?: any) {
    try {
      const receiptContent = this.generateReceiptHTML(sale, businessInfo);
      
      const printWindow = window.open('', '_blank', 'width=300,height=600');
      if (!printWindow) {
        console.error('Failed to open print window - popup blocked');
        return;
      }
      
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (error) {
          console.error('Print error:', error);
        }
      }, 250);
    } catch (error) {
      console.error('Receipt generation error:', error);
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
          ${this.generateItemsHTML(sale.details || [])}
        </div>
        
        <div class="total-section">
          ${(() => {
            const totalNum = Number(sale.total || 0);
            const discountNum = Number(sale.discount || 0);
            const subtotalNum = totalNum + discountNum;
            return `
          <div class="item">
            <span>Subtotal:</span>
            <span>$${subtotalNum.toFixed(2)}</span>
          </div>
          ${discountNum > 0 ? `
            <div class="item">
              <span>Descuento:</span>
              <span>-$${discountNum.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="item total">
            <span>TOTAL:</span>
            <span>$${totalNum.toFixed(2)}</span>
          </div>`;
          })()}
          ${sale.payments && sale.payments.length > 1 ? `
            <div style="font-size: 11px; margin: 5px 0;">
              <strong>Pagos:</strong>
            </div>
            ${this.generatePaymentsHTML(sale.payments)}
          ` : `
            <div class="item">
              <span>Método:</span>
              <span>${this.getPaymentMethodLabel(sale.payment_method || 'cash')}</span>
            </div>
          `}
          ${(() => {
            const paidNum = Number(sale.paid || 0);
            const totalNum = Number(sale.total || 0);
            const changeNum = paidNum - totalNum;
            return `
          <div class="item">
            <span>Pagado:</span>
            <span>$${paidNum.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>Cambio:</span>
            <span>$${changeNum.toFixed(2)}</span>
          </div>`;
          })()}
        </div>
        
        <div class="footer">
          <div>¡Gracias por su compra!</div>
          <div>Vuelva pronto</div>
        </div>
      </body>
      </html>
    `;
  }

  private generateItemsHTML(details: any[]): string {
    return details.map(item => {
      const name = item.name || 'Unknown Item';
      const priceNum = Number(item.price) || 0;
      const quantity = item.quantity || 0;
      const itemTotal = priceNum * quantity;
      return `
        <div class="item">
          <span>${name}</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
        <div style="font-size: 10px; color: #666;">
          ${quantity} x $${priceNum.toFixed(2)}
        </div>
      `;
    }).join('');
  }

  private generatePaymentsHTML(payments: Payment[]): string {
    return payments.map(payment => {
      const amountNum = Number(payment.amount);
      return `
        <div class="item" style="font-size: 10px;">
          <span>${this.getPaymentMethodLabel(payment.method)}:</span>
          <span>$${amountNum.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  private generateDenominationsHTML(denominations: any[]): string {
    return denominations.map(d => `
      <div class="denomination">
        <span>$${d.value.toFixed(2)} x ${d.count}</span>
        <span>$${d.total.toFixed(2)}</span>
      </div>
    `).join('');
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

  private getDifferenceClass(difference: number): string {
    if (difference < 0) return 'shortage';
    if (difference > 0) return 'surplus';
    return 'exact';
  }

  private getDifferenceText(difference: number): string {
    if (difference < 0) {
      return `⚠️ FALTANTE: $${Math.abs(difference).toFixed(2)}`;
    }
    if (difference > 0) {
      return `✅ SOBRANTE: $${difference.toFixed(2)}`;
    }
    return '✓ CAJA CUADRADA - SIN DIFERENCIAS';
  }

  printCashRegisterReport(register: any, denominations: any[]) {
    try {
      const reportContent = this.generateCashReportHTML(register, denominations);
      
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
        console.error('Failed to open print window - popup blocked');
        return;
      }
      
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (error) {
          console.error('Print error:', error);
        }
      }, 250);
    } catch (error) {
      console.error('Cash report generation error:', error);
    }
  }

  private generateCashReportHTML(register: any, denominations: any[]): string {
    const openDate = new Date(register.opened_at).toLocaleString();
    const closeDate = register.closed_at ? new Date(register.closed_at).toLocaleString() : 'En curso';
    
    const totalCounted = denominations.reduce((sum, d) => sum + (d?.total || 0), 0);
    const expectedTotal = register.opening_amount + register.total_sales;
    const difference = totalCounted - expectedTotal;
    
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
          .difference { font-size: 14px; font-weight: bold; padding: 10px; margin: 10px 0; border: 2px solid; text-align: center; }
          .shortage { background-color: #ffebee; border-color: #f44336; color: #c62828; }
          .surplus { background-color: #e8f5e8; border-color: #4caf50; color: #2e7d32; }
          .exact { background-color: #f3f4f6; border-color: #6b7280; color: #374151; }
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
          <div>Total esperado: $${expectedTotal.toFixed(2)}</div>
          <div>Total contado: $${totalCounted.toFixed(2)}</div>
        </div>
        
        <div class="difference ${this.getDifferenceClass(difference)}">
          ${this.getDifferenceText(difference)}
        </div>
        
        <div class="section">
          <h3>Denominaciones</h3>
          ${this.generateDenominationsHTML(denominations)}
          <div class="denomination total">
            <span>TOTAL CONTADO:</span>
            <span>$${totalCounted.toFixed(2)}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}