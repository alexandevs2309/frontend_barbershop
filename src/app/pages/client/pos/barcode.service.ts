import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private scannedCodeSubject = new Subject<string>();
  public scannedCode$ = this.scannedCodeSubject.asObservable();
  
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  public isListening$ = this.isListeningSubject.asObservable();
  
  private barcodeBuffer = '';
  private barcodeTimeout: any;

  constructor() {
    this.setupBarcodeListener();
  }

  private setupBarcodeListener() {
    document.addEventListener('keydown', (event) => {
      if (!this.isListeningSubject.getValue()) return;

      // Clear timeout on each keystroke
      clearTimeout(this.barcodeTimeout);

      // If Enter key, process the barcode
      if (event.key === 'Enter') {
        if (this.barcodeBuffer.length > 3) { // Minimum barcode length
          this.scannedCodeSubject.next(this.barcodeBuffer);
          this.barcodeBuffer = '';
        }
        event.preventDefault();
        return;
      }

      // Add character to buffer if it's alphanumeric
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        this.barcodeBuffer += event.key;
        
        // Set timeout to clear buffer if no more input
        this.barcodeTimeout = setTimeout(() => {
          this.barcodeBuffer = '';
        }, 100);
      }
    });
  }

  startListening() {
    this.isListeningSubject.next(true);
    this.barcodeBuffer = '';
  }

  stopListening() {
    this.isListeningSubject.next(false);
    this.barcodeBuffer = '';
  }

  generateBarcode(productId: number): string {
    // Simple barcode generation (in real app, use proper algorithm)
    return `7${productId.toString().padStart(11, '0')}`;
  }

  validateBarcode(code: string): boolean {
    // Basic validation - should be 12-13 digits
    return /^\d{12,13}$/.test(code);
  }
}