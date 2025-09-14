import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  // Quotations persistence
  saveQuotations(quotations: any[]): void {
    localStorage.setItem('pos_quotations', JSON.stringify(quotations));
  }
  
  loadQuotations(): any[] {
    const stored = localStorage.getItem('pos_quotations');
    return stored ? JSON.parse(stored) : [];
  }
  
  // Cash register persistence
  saveCashRegister(register: any): void {
    localStorage.setItem('pos_cash_register', JSON.stringify(register));
  }
  
  loadCashRegister(): any {
    const stored = localStorage.getItem('pos_cash_register');
    return stored ? JSON.parse(stored) : null;
  }
  
  // Cart backup
  saveCartBackup(cart: any): void {
    localStorage.setItem('pos_cart_backup', JSON.stringify({
      ...cart,
      timestamp: Date.now()
    }));
  }
  
  loadCartBackup(): any {
    const stored = localStorage.getItem('pos_cart_backup');
    if (stored) {
      const backup = JSON.parse(stored);
      // Only restore if less than 1 hour old
      if (Date.now() - backup.timestamp < 3600000) {
        return backup;
      }
    }
    return null;
  }
  
  clearCartBackup(): void {
    localStorage.removeItem('pos_cart_backup');
  }
  
  // Offline sales queue
  saveOfflineSale(sale: any): void {
    const queue = this.getOfflineQueue();
    queue.push({...sale, offline_id: Date.now()});
    localStorage.setItem('pos_offline_queue', JSON.stringify(queue));
  }
  
  getOfflineQueue(): any[] {
    const stored = localStorage.getItem('pos_offline_queue');
    return stored ? JSON.parse(stored) : [];
  }
  
  clearOfflineQueue(): void {
    localStorage.setItem('pos_offline_queue', JSON.stringify([]));
  }
}