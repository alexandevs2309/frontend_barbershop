import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  phone?: string;
  planType: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface RegisterResponse {
  email: string;
  full_name: string;
  phone: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  registerWithPlan(data: RegisterData): Observable<RegisterResponse> {
    // Mapear datos al formato esperado por el backend SaaS
    const registerData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      businessName: data.businessName,
      planType: data.planType,
      address: 'Dirección por defecto'
    };
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, registerData);
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