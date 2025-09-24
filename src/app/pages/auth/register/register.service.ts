import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface RegisterData {
  fullName: string;
  email: string;
  businessName: string;
  phone?: string;
  planType: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  account: {
    tenant_id: number;
    user_id: number;
    business_name: string;
    plan: string;
    plan_price: number;
    trial_days: number;
  };
  payment: {
    success: boolean;
    transaction_id: string;
    amount: number;
    currency: string;
    payment_method: {
      type: string;
      last4: string;
      brand: string;
      exp_month: number;
      exp_year: number;
    };
    receipt_url: string;
    status: string;
    created: number;
  };
  login_url: string;
  credentials: {
    email: string;
    password: string;
    note: string;
  };
  next_steps: string[];
  email_status: {
    email_sent: boolean;
    message_id: string;
    recipient: string;
    template: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  registerWithPlan(data: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, data);
  }

  validateCardNumber(cardNumber: string): boolean {
    // Algoritmo de Luhn para validar número de tarjeta
    const num = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(num)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  formatCardNumber(cardNumber: string): string {
    // Formatear número de tarjeta con espacios
    return cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiryDate(expiryDate: string): string {
    // Formatear fecha de vencimiento MM/AA
    const cleaned = expiryDate.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  }

  validateExpiryDate(expiryDate: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  }
}