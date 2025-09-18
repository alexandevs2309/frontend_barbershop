import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { sanitizeForLog } from '../../../shared/utils/error.util';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncStatusSubject = new BehaviorSubject<boolean>(false);
  public syncStatus$ = this.syncStatusSubject.asObservable();
  
  private terminalId = 'POS_' + Math.random().toString(36).substr(2, 9);
  private lastSync = Date.now();
  
  constructor() {
    // Simulate real-time sync every 30 seconds
    interval(30000).subscribe(() => {
      this.syncData();
    });
    
    // Listen to storage changes from other terminals
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('pos_sync_')) {
        this.handleSyncEvent(e);
      }
    });
  }
  
  // Broadcast changes to other terminals
  broadcastChange(type: string, data: any): void {
    const syncData = {
      terminalId: this.terminalId,
      type,
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`pos_sync_${type}_${Date.now()}`, JSON.stringify(syncData));
    
    // Clean old sync events
    this.cleanOldSyncEvents();
  }
  
  // Handle sync events from other terminals
  private handleSyncEvent(event: StorageEvent): void {
    if (event.newValue) {
      try {
        const syncData = JSON.parse(event.newValue);
        
        // Ignore own events
        if (syncData.terminalId === this.terminalId) return;
      
      // Process sync event
      switch (syncData.type) {
        case 'stock_update':
          this.handleStockUpdate(syncData.data);
          break;
        case 'cash_register':
          this.handleCashRegisterUpdate(syncData.data);
          break;
        case 'sale_processed':
          this.handleSaleProcessed(syncData.data);
          break;
      }
      } catch (error) {
        console.error('Failed to parse sync event:', error);
      }
    }
  }
  
  private handleStockUpdate(data: any): void {
    // Update local stock data
    console.log(`[${this.terminalId}] Stock updated from terminal ${data.terminalId}:`, sanitizeForLog(data));
  }
  
  private handleCashRegisterUpdate(data: any): void {
    // Update cash register status
    console.log(`[${this.terminalId}] Cash register updated from terminal ${data.terminalId}:`, sanitizeForLog(data));
  }
  
  private handleSaleProcessed(data: any): void {
    // Update sales data
    console.log(`[${this.terminalId}] Sale processed on terminal ${data.terminalId}:`, sanitizeForLog(data));
  }
  
  private syncData(): void {
    this.syncStatusSubject.next(true);
    
    // Simulate sync process
    setTimeout(() => {
      this.lastSync = Date.now();
      this.syncStatusSubject.next(false);
    }, 2000);
  }
  
  private cleanOldSyncEvents(): void {
    const cutoff = Date.now() - 300000; // 5 minutes
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pos_sync_')) {
        const timestamp = parseInt(key.split('_').pop() || '0');
        if (timestamp < cutoff) {
          localStorage.removeItem(key);
        }
      }
    });
  }
  
  getTerminalId(): string {
    return this.terminalId;
  }
  


  getLastSync(): Date {
    return new Date(this.lastSync);
  }
}