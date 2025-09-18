import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CashRegister {
  id?: number;
  opening_amount: number;
  closing_amount?: number;
  total_sales: number;
  opened_at: string;
  closed_at?: string;
  is_open: boolean;
  user_id: number;
}

export interface Denomination {
  value: number;
  count: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private currentRegisterSubject = new BehaviorSubject<CashRegister | null>(null);
  public currentRegister$ = this.currentRegisterSubject.asObservable();

  denominations: Denomination[] = [
    { value: 100, count: 0, total: 0 },
    { value: 50, count: 0, total: 0 },
    { value: 20, count: 0, total: 0 },
    { value: 10, count: 0, total: 0 },
    { value: 5, count: 0, total: 0 },
    { value: 1, count: 0, total: 0 },
    { value: 0.25, count: 0, total: 0 },
    { value: 0.10, count: 0, total: 0 },
    { value: 0.05, count: 0, total: 0 },
    { value: 0.01, count: 0, total: 0 }
  ];

  openRegister(openingAmount: number): CashRegister {
    const register: CashRegister = {
      opening_amount: openingAmount,
      total_sales: 0,
      opened_at: new Date().toISOString(),
      is_open: true,
      user_id: 1 // Get from auth service
    };
    this.currentRegisterSubject.next(register);
    return register;
  }

  closeRegister(closingAmount: number): CashRegister | null {
    const current = this.currentRegisterSubject.getValue();
    if (current) {
      current.closing_amount = closingAmount;
      current.closed_at = new Date().toISOString();
      current.is_open = false;
      this.currentRegisterSubject.next(current);
    }
    return current;
  }

  addSale(amount: number) {
    const current = this.currentRegisterSubject.getValue();
    if (current) {
      current.total_sales += amount;
      this.currentRegisterSubject.next(current);
    }
  }

  calculateTotal(): number {
    return this.denominations.reduce((sum, d) => sum + (isNaN(d.total) ? 0 : d.total || 0), 0);
  }

  updateDenomination(value: number, count: number) {
    const denomination = this.denominations.find(d => d.value === value);
    if (denomination) {
      denomination.count = count;
      denomination.total = count * value;
    }
  }

  isRegisterOpen(): boolean {
    return this.currentRegisterSubject.getValue()?.is_open || false;
  }
}