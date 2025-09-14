import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$ = this.onlineSubject.asObservable();
  
  constructor() {
    // Listen to online/offline events
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(status => {
      this.onlineSubject.next(status);
    });
  }
  
  isOnline(): boolean {
    return this.onlineSubject.value;
  }
  
  // Simulate API calls when offline
  mockApiCall<T>(data: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), 500);
    });
  }
  
  // Queue operations for when back online
  queueOperation(operation: any): void {
    const queue = JSON.parse(localStorage.getItem('operation_queue') || '[]');
    queue.push({
      ...operation,
      timestamp: Date.now()
    });
    localStorage.setItem('operation_queue', JSON.stringify(queue));
  }
  
  // Process queued operations when back online
  processQueue(): Promise<void> {
    return new Promise((resolve) => {
      const queue = JSON.parse(localStorage.getItem('operation_queue') || '[]');
      // In real app, send queued operations to server
      console.log('Processing offline queue:', queue);
      localStorage.setItem('operation_queue', '[]');
      resolve();
    });
  }
}