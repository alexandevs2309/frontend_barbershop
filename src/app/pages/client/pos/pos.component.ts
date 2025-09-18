import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environment';

// PrimeNG Modules
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { PosService, Sale, SaleDetail } from './pos.service';
import { ClientsService, Client } from '../clients/clients.service';
import { ServicesService, Service } from '../services/services.service';
import { CartService } from '../../service/cart.service';
import { CashRegisterService, CashRegister } from './cash-register.service';
import { PrintService } from './print.service';
import { AuthService } from '../../auth/service/auth.service';
import { EmployeeIdUtil } from '../../../shared/utils/employee-id.util';
import { ErrorUtil } from '../../../shared/utils/error.util';

import { EmployeeSelectorComponent } from './employee-selector.component';

// Interfaces
interface ServiceWithQuantity extends Service {
  quantity: number;
}

interface ProductWithQuantity {
  id: number;
  name: string;
  description?: string | undefined;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
  stock?: number;
}

interface FilterableItem {
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
}

interface Denomination {
  value: number;
  count: number;
  total?: number;
  _lastCount?: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  styleUrls: ['./pos.component.scss'],
  styles: [`
    .cash-register-card {
      max-width: 500px;
    }
  `],
  imports: [
    CommonModule, FormsModule, TabViewModule, CardModule, ButtonModule,
    InputNumberModule, MultiSelectModule, TableModule, ToastModule, TagModule,
    DropdownModule, InputTextModule, DividerModule, BadgeModule, SkeletonModule,
    ConfirmDialogModule, ToggleSwitchModule, DialogModule, EmployeeSelectorComponent
  ],
  providers: [MessageService, ConfirmationService, PosService, ClientsService, ServicesService, CartService, CashRegisterService, PrintService],
  template: `
<div class="pos-container min-h-screen bg-gray-50">
  <div *ngIf="isCheckingCashRegister" class="loading-state flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card border-round-xl shadow-2 p-6 text-center loading-card">
      <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3 block"></i>
      <h3 class="text-xl font-bold text-900 mb-2">Verificando Estado de Caja</h3>
      <p class="text-600 m-0">Comprobando si hay una caja registradora abierta...</p>
    </div>
  </div>

  <div *ngIf="showPosContent">
    <div class="header-section bg-white shadow-sm border-bottom-2 surface-border p-4">
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-cut text-4xl text-primary"></i>
          <div>
            <h1 class="text-3xl font-bold text-900 m-0">Sistema POS - Peluquería</h1>
            <p class="text-600 m-0">Punto de Venta</p>
          </div>
        </div>
        <div class="flex align-items-center gap-3">
          <div class="toolbar-buttons flex gap-2">
            <p-button
              icon="pi pi-calculator"
              label="Caja"
              severity="info"
              (click)="showCashRegister = true"
              size="small"
              *ngIf="canManageCashRegister()">
            </p-button>
            <p-button
              icon="pi pi-history"
              label="Historial"
              severity="info"
              (click)="openSalesHistory()"
              size="small"
              *ngIf="canViewSalesHistory()">
            </p-button>
            <p-button
              icon="pi pi-dollar"
              label="Mis Ganancias"
              severity="warn"
              (click)="showEarnings = true"
              size="small"
              *ngIf="canViewEarnings()">
            </p-button>
            <p-button
              icon="pi pi-chart-bar"
              label="Ganancias por Empleado"
              severity="success"
              (click)="showEmployeeEarnings = true"
              size="small"
              *ngIf="canManageCashRegister()">
            </p-button>
          </div>
          <div class="text-right">
            <div class="text-sm text-600">{{ getUserRoleDisplay() }}</div>
            <div class="text-2xl font-bold text-green-600" *ngIf="canManageCashRegister()">
              {{ (currentRegister?.total_sales || 0) | currency:'USD' }}
            </div>
            <div class="text-xs text-500" *ngIf="currentRegister && canManageCashRegister()">
              Caja {{ currentRegister.is_open ? 'Abierta' : 'Cerrada' }} | Fondo: {{ (currentRegister.opening_amount || 0) | currency:'USD' }}
            </div>
            <div class="text-xs text-400" *ngIf="currentRegister && canManageCashRegister()">
              Total en caja: {{ totalCashAmount | currency:'USD' }}
            </div>
            <div class="text-lg font-semibold text-primary" *ngIf="!canManageCashRegister()">
              Sistema POS
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid p-4">
      <div class="catalog-panel">
        <div class="surface-card border-round-xl shadow-2 p-4 h-full">
          <div class="filters-section mb-4">
            <div class="flex gap-3 mb-3">
              <div class="flex-1">
                <span class="p-input-icon-left w-full">
                  <i class="pi pi-search"></i>
                  <input type="text"
                         id="search-input"
                         name="searchTerm"
                         pInputText
                         [(ngModel)]="searchTerm"
                         (input)="filterItems()"
                         placeholder="Buscar servicios y productos..."
                         class="w-full" />
                </span>
              </div>
              <p-dropdown
                [options]="categories"
                [(ngModel)]="selectedCategory"
                (onChange)="filterItems()"
                placeholder="Categoría"
                optionLabel="name"
                optionValue="value"
                [showClear]="true"
                styleClass="min-w-max">
              </p-dropdown>
            </div>
          </div>

          <p-tabView [(activeIndex)]="activeTabIndex" styleClass="custom-tabs">
            <p-tabPanel>
              <ng-template pTemplate="header">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-scissors"></i>
                  <span>Servicios</span>
                  <p-badge [value]="filteredServices.length" severity="info"></p-badge>
                </div>
              </ng-template>

              <div class="services-grid">
                <div class="service-multiselect mb-4">
                  <p-multiSelect
                    [options]="filteredServices"
                    [(ngModel)]="selectedServices"
                    optionLabel="name"
                    display="chip"
                    placeholder="Seleccionar servicios..."
                    [filter]="true"
                    [showToggleAll]="false"
                    styleClass="w-full custom-multiselect"
                    [appendTo]="'body'"
                    (onChange)="addSelectedServices()">
                    <ng-template let-service pTemplate="item">
                      <div class="service-option flex align-items-center justify-content-between w-full p-2">
                        <div class="flex align-items-center gap-2">
                          <div class="service-icon" [style.background-color]="getCategoryColor(service.category)">
                            <i class="{{ getServiceIcon(service.category) }} text-white"></i>
                          </div>
                          <div>
                            <div class="font-semibold">{{ service.name }}</div>
                            <div class="text-sm text-600">{{ service.category }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-bold text-green-700">{{ service.price | currency:'USD' }}</div>
                          <div class="text-xs text-600">{{ service.duration || 30 }} min</div>
                        </div>
                      </div>
                    </ng-template>
                  </p-multiSelect>
                </div>
              </div>
            </p-tabPanel>

            <p-tabPanel>
              <ng-template pTemplate="header">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-shopping-bag"></i>
                  <span>Productos</span>
                  <p-badge [value]="filteredProducts.length" severity="success"></p-badge>
                </div>
              </ng-template>

              <div class="products-section">
                <div *ngIf="loadingProducts" class="grid">
                  <div class="col-6 md:col-4 xl:col-3" *ngFor="let item of [1,2,3,4,5,6,7,8]">
                    <div class="surface-card border-round-lg p-3">
                      <p-skeleton height="8rem" styleClass="mb-3"></p-skeleton>
                      <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
                      <p-skeleton height="1rem" width="60%"></p-skeleton>
                    </div>
                  </div>
                </div>

                <div *ngIf="!loadingProducts" class="products-grid">
                  <div class="product-item"
                       *ngFor="let product of filteredProducts; trackBy: trackByProductId"
                       [id]="'product-' + product.id">

                    <div class="product-card surface-card border-round-xl overflow-hidden shadow-1 transition-all transition-duration-200 cursor-pointer h-full"
                         (click)="addProductToCart(product)"
                         [class.product-card-selected]="cartService.isProductInCart(product.id)">

                      <div class="product-image-container relative">
                        <img [src]="product.image || 'assets/placeholder.png'"
                             [alt]="product.name"
                             class="product-image w-full object-cover"
                             [class.placeholder-image]="!product.image"/>

                        <div class="stock-badge absolute top-0 right-0 m-2" *ngIf="(product.stock ?? 0) > 0">
                          <p-badge
                            [value]="product.stock ?? 0"
                            [severity]="getStockSeverity(product.stock ?? 0)"
                            [title]="'Stock disponible: ' + (product.stock ?? 0)">
                          </p-badge>
                        </div>
                      </div>

                      <div class="product-info p-3">
                        <div class="product-name font-bold text-900 mb-1 line-height-3">{{ product.name }}</div>
                        <div class="product-category text-sm text-600 mb-2" *ngIf="product.category">
                          {{ product.category }}
                        </div>
                        <div class="product-price text-xl font-bold text-green-700 mb-3">
                          {{ product.price | currency:'USD' }}
                        </div>

                        <p-button
                          label="Agregar"
                          icon="pi pi-cart-plus"
                          styleClass="w-full p-button-success add-to-cart-btn"
                          [disabled]="!product.stock"
                          (click)="$event.stopPropagation(); addProductToCart(product)">
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="!loadingProducts && !filteredProducts.length" class="empty-state text-center p-6">
                  <i class="pi pi-search text-6xl text-300 mb-3 block"></i>
                  <p class="text-xl text-600 mb-2">No se encontraron productos</p>
                  <p class="text-600">Intenta cambiar los filtros de búsqueda</p>
                </div>
              </div>
            </p-tabPanel>
          </p-tabView>
        </div>
      </div>

      <div class="cart-panel">
        <div class="surface-card border-round-xl shadow-2 h-full cart-container">
          <div class="cart-header p-4 border-bottom-1 surface-border">
            <div class="flex align-items-center justify-content-between mb-3">
              <h3 class="cart-title text-2xl font-bold m-0">
                <i class="pi pi-shopping-cart mr-2 text-primary"></i>
                Carrito de Compras
              </h3>
              <p-badge
                [value]="cartItemsCount"
                severity="info"
                size="large">
              </p-badge>
            </div>

            <div class="client-selection">
              <label class="block text-sm font-semibold text-700 mb-2">Cliente</label>
              <p-dropdown
                [options]="clients"
                [(ngModel)]="currentSale.client"
                optionLabel="name"
                optionValue="id"
                placeholder="Seleccionar cliente..."
                [filter]="true"
                filterBy="name"
                [showClear]="true"
                styleClass="w-full">
                <ng-template let-client pTemplate="selectedItem">
                  <div class="selected-client" *ngIf="client">
                    <div class="font-semibold">{{ client.name }}</div>
                    <div class="text-sm text-500">{{ client.phone || client.email }}</div>
                  </div>
                </ng-template>
                <ng-template let-client pTemplate="item">
                  <div class="client-option">
                    <div class="font-semibold">{{ client.name }}</div>
                    <div class="text-sm text-600">{{ client.phone || client.email }}</div>
                  </div>
                </ng-template>
              </p-dropdown>
            </div>
          </div>

          <div class="cart-items-content">
            <div *ngFor="let detail of cartDetails"
                 class="cart-item p-3 border-bottom-1 surface-border hover:surface-hover transition-colors">
              <div class="flex align-items-start gap-3">
                <div class="flex-1">
                  <div class="item-name font-semibold text-900 mb-1">{{ detail.name }}</div>
                  <div class="item-details flex align-items-center gap-2 mb-2">
                    <p-tag
                      [value]="detail.item_type === 'service' ? 'Servicio' : 'Producto'"
                      [severity]="detail.item_type === 'service' ? 'info' : 'success'"
                      class="text-xs">
                    </p-tag>
                    <span class="text-sm text-600">{{ detail.price | currency:'USD' }} c/u</span>
                  </div>

                  <!-- Selector de empleado para servicios -->
                  <app-employee-selector
                    *ngIf="detail.item_type === 'service'"
                    [employees]="employees"
                    [selectedEmployeeId]="getEmployeeId(detail)"
                    (employeeChange)="setEmployeeId(detail, $event)">
                  </app-employee-selector>
                </div>

                <div class="text-right flex-grow-1 flex-shrink-0" style="min-width: 150px;">
                  <div class="quantity-controls flex align-items-center justify-content-end gap-2 mb-2">
                    <p-button
                      icon="pi pi-minus"
                      styleClass="p-button-rounded p-button-text p-button-sm"
                      (click)="cartService.updateQuantity(detail, -1)"
                      [disabled]="detail.quantity <= 1">
                    </p-button>
                    <span class="quantity-display px-3 py-1 bg-primary-50 border-round font-bold text-primary">
                      {{ detail.quantity }}
                    </span>
                    <p-button
                      icon="pi pi-plus"
                      styleClass="p-button-rounded p-button-text p-button-sm"
                      (click)="cartService.updateQuantity(detail, 1)">
                    </p-button>
                  </div>
                  <div class="item-total text-xl font-bold text-green-700">
                    {{ (detail.quantity * detail.price) | currency:'USD' }}
                  </div>
                </div>
                <p-button
                  icon="pi pi-trash"
                  styleClass="p-button-rounded p-button-danger p-button-text p-button-sm"
                  (click)="cartService.removeItem(detail)"
                  pTooltip="Eliminar item">
                </p-button>
              </div>
            </div>

            <div *ngIf="!cartDetails.length" class="empty-cart text-center p-6">
              <i class="pi pi-shopping-cart text-6xl text-300 mb-3 block"></i>
              <p class="text-xl text-600 mb-2">Carrito vacío</p>
              <p class="text-600">Agrega productos o servicios para comenzar</p>
            </div>
          </div>

          <div class="cart-footer-content p-4 border-top-1 surface-border">
            <!-- Quick Summary -->
            <div class="quick-summary p-3 bg-gray-50 border-round mb-3">
              <div class="flex justify-content-between align-items-center mb-2">
                <span class="font-medium">Subtotal:</span>
                <span class="font-bold">{{ subtotalAmount | currency:'USD' }}</span>
              </div>
              <div class="flex justify-content-between align-items-center mb-2" *ngIf="currentSale.discount && currentSale.discount > 0">
                <span class="font-medium">Descuento:</span>
                <span class="font-bold text-red-600">-{{ discountAmount | currency:'USD' }}</span>
              </div>
              <div class="flex justify-content-between align-items-center">
                <span class="text-2xl font-bold text-primary">TOTAL:</span>
                <span class="text-2xl font-bold text-primary">{{ cartTotal | currency:'USD' }}</span>
              </div>
            </div>

            <!-- Discount Section -->
            <div class="discount-section mb-3">
              <div class="flex justify-content-between align-items-center mb-2">
                <label class="text-sm font-semibold">
                  Descuento
                  <span class="text-xs text-500 ml-1">
                    (máx: {{ isPercentageDiscount ? '100%' : (subtotalAmount | currency:'USD') }})
                  </span>
                </label>
                <div class="flex align-items-center gap-2">
                  <span class="text-sm" [class.font-bold]="!isPercentageDiscount">$</span>
                  <p-toggleSwitch [(ngModel)]="isPercentageDiscount"></p-toggleSwitch>
                  <span class="text-sm" [class.font-bold]="isPercentageDiscount">%</span>
                </div>
              </div>
              <p-inputNumber
                [(ngModel)]="currentSale.discount"
                [mode]="isPercentageDiscount ? 'decimal' : 'currency'"
                [currency]="isPercentageDiscount ? undefined : 'USD'"
                [suffix]="isPercentageDiscount ? '%' : undefined"
                [min]="0"
                [max]="isPercentageDiscount ? 100 : subtotalAmount"
                styleClass="w-full"
                [placeholder]="isPercentageDiscount ? '0' : '0.00'">
              </p-inputNumber>
            </div>

            <!-- Payment Section -->
            <div class="payment-section mb-3">
              <div class="flex justify-content-between align-items-center mb-2">
                <label class="text-sm font-semibold">Pagos</label>
                <p-button
                  [label]="showMultiplePayments ? 'Pago Simple' : 'Pago Múltiple'"
                  [icon]="showMultiplePayments ? 'pi pi-minus' : 'pi pi-plus'"
                  styleClass="p-button-text p-button-sm"
                  (click)="toggleMultiplePayments()">
                </p-button>
              </div>

              <!-- Pago Simple -->
              <div *ngIf="!showMultiplePayments">
                <div class="payment-method mb-3">
                  <label class="block text-sm font-semibold mb-2">Método de Pago</label>
                  <p-dropdown
                    [options]="paymentMethods"
                    [(ngModel)]="currentSale.payment_method"
                    optionLabel="label"
                    optionValue="value"
                    styleClass="w-full">
                  </p-dropdown>
                </div>

                <div class="paid-amount mb-3">
                  <label class="block text-sm font-semibold mb-2">Monto Recibido</label>
                  <p-inputNumber
                    [(ngModel)]="currentSale.paid"
                    mode="currency"
                    currency="USD"
                    [min]="0"
                    styleClass="w-full"
                    placeholder="0.00">
                  </p-inputNumber>
                </div>
              </div>

              <!-- Pagos Múltiples -->
              <div *ngIf="showMultiplePayments">
                <!-- Lista de pagos existentes -->
                <div class="existing-payments mb-3" *ngIf="payments.length > 0">
                  <div class="payment-item flex justify-content-between align-items-center p-2 border-round mb-2 bg-gray-50"
                       *ngFor="let payment of payments; let i = index">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-credit-card text-primary"></i>
                      <span class="font-semibold">{{ getPaymentMethodLabel(payment.method) }}</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <span class="font-bold text-green-700">{{ payment.amount | currency:'USD' }}</span>
                      <p-button
                        icon="pi pi-trash"
                        styleClass="p-button-rounded p-button-danger p-button-text p-button-sm"
                        (click)="removePayment(i)">
                      </p-button>
                    </div>
                  </div>
                </div>

                <!-- Agregar nuevo pago -->
                <div class="add-payment-section p-3 border-round border-dashed surface-border mb-3">
                  <div class="grid">
                    <div class="col-6">
                      <label class="block text-sm font-semibold mb-2">Método</label>
                      <p-dropdown
                        [options]="paymentMethods"
                        [(ngModel)]="currentPaymentMethod"
                        optionLabel="label"
                        optionValue="value"
                        styleClass="w-full">
                      </p-dropdown>
                    </div>
                    <div class="col-6">
                      <label class="block text-sm font-semibold mb-2">
                        Monto
                        <span class="text-xs text-500">(máx: {{ remainingAmount | currency:'USD' }})</span>
                      </label>
                      <p-inputNumber
                        [(ngModel)]="currentPaymentAmount"
                        mode="currency"
                        currency="USD"
                        [min]="0"
                        [max]="remainingAmount"
                        styleClass="w-full"
                        placeholder="0.00">
                      </p-inputNumber>
                    </div>
                  </div>
                  <p-button
                    label="Agregar Pago"
                    icon="pi pi-plus"
                    styleClass="w-full mt-2"
                    [disabled]="!canAddPayment"
                    (click)="addPayment()">
                  </p-button>
                </div>

                <!-- Resumen de pagos múltiples -->
                <div class="payments-summary p-3 bg-blue-50 border-round mb-3" *ngIf="payments.length > 0">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <span class="font-semibold">Total Pagado:</span>
                    <span class="font-bold text-blue-700">{{ totalPaid | currency:'USD' }}</span>
                  </div>
                  <div class="flex justify-content-between align-items-center">
                    <span class="font-semibold">Pendiente:</span>
                    <span class="font-bold" [class.text-red-600]="remainingAmount > 0" [class.text-green-600]="remainingAmount === 0">
                      {{ remainingAmount | currency:'USD' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="change-section p-3 border-round mb-3"
                 [ngClass]="{
                   'bg-green-50 border-green-200': changeAmount >= 0,
                   'bg-red-50 border-red-200': changeAmount < 0
                 }">
              <div class="flex justify-content-between align-items-center">
                <span class="font-semibold"
                      [ngClass]="{
                        'text-green-800': changeAmount >= 0,
                        'text-red-800': changeAmount < 0
                      }">
                  {{ changeAmount >= 0 ? 'Cambio:' : 'Falta:' }}
                </span>
                <span class="text-xl font-bold"
                      [ngClass]="{
                        'text-green-800': changeAmount >= 0,
                        'text-red-800': changeAmount < 0
                      }">
                  {{ Math.abs(changeAmount) | currency:'USD' }}
                </span>
              </div>
              <div *ngIf="showMultiplePayments && payments.length > 0" class="text-xs text-600 mt-1">
                Efectivo: {{ cashAmount | currency:'USD' }} | Otros: {{ (totalPaid - cashAmount) | currency:'USD' }}
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons-fixed">
              <p-button
                label="Procesar Venta"
                icon="pi pi-credit-card"
                styleClass="p-button-lg w-full mb-2 process-sale-btn"
                [disabled]="!canProcessSaleWithPayments() || !canProcessSalesCache"
                [loading]="processing"
                (click)="confirmProcessSale()"
                *ngIf="canProcessSalesCache">
              </p-button>

              <!-- Mensaje para usuarios sin permisos de venta -->
              <div *ngIf="!canProcessSalesCache" class="p-3 bg-orange-50 border-round text-center">
                <i class="pi pi-info-circle text-orange-600 text-2xl mb-2 block"></i>
                <p class="text-orange-800 font-semibold m-0">Sin permisos de venta</p>
                <p class="text-orange-600 text-sm m-0">Contacte al administrador</p>
              </div>

              <div class="secondary-actions flex gap-2">
                <p-button
                  icon="pi pi-trash"
                  label="Limpiar"
                  styleClass="p-button-outlined p-button-danger flex-1"
                  (click)="cartService.clearCart()"
                  [disabled]="processing">
                </p-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="showCashRegisterRequired" class="cash-register-required flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card border-round-xl shadow-2 p-6 text-center cash-register-card">
      <i class="pi pi-lock text-6xl text-orange-500 mb-4 block"></i>
      <h2 class="text-3xl font-bold text-900 mb-3">Caja Registradora Requerida</h2>
      <p class="text-600 mb-4 line-height-3">
        Para acceder al sistema POS, primero debe abrir la caja registradora con un monto inicial.
        Esto es necesario para el control de efectivo y el registro de ventas.
      </p>
      <p-button
        label="Abrir Caja Registradora"
        icon="pi pi-unlock"
        size="large"
        styleClass="w-full"
        (click)="onOpenCashRegister()">
      </p-button>
    </div>
  </div>

<p-toast position="top-right"></p-toast>
<p-confirmDialog header="Confirmar Venta" icon="pi pi-exclamation-triangle"></p-confirmDialog>

<!-- Cash Register Dialog -->
<p-dialog header="Gestión de Caja" [(visible)]="showCashRegister" [modal]="true" [style]="{width: '500px'}" [closable]="true" [closeOnEscape]="true" *ngIf="canManageCashRegisterCache">
  <div class="cash-register-content">
    <div *ngIf="!currentRegister?.is_open" class="open-register">
      <h4>Abrir Caja</h4>
      <div class="field">
        <label>Fondo Inicial</label>
        <p-inputNumber [(ngModel)]="currentSale.paid" mode="currency" currency="USD" styleClass="w-full"></p-inputNumber>
      </div>
      <p-button label="Abrir Caja" icon="pi pi-unlock" styleClass="w-full"
               (click)="openCashRegister(currentSale.paid || 0)"></p-button>
    </div>

    <div *ngIf="currentRegister?.is_open" class="close-register">
      <h4>Arqueo de Caja</h4>
        <div class="denominations-grid">
      <div class="denomination-row" *ngFor="let denom of cashRegisterService.denominations; trackBy: trackByDenominationValue">
          <div class="flex align-items-center gap-3 mb-2">
            <span class="denomination-value w-3">{{ denom.value | currency:'USD' }}</span>
            <p-inputNumber [(ngModel)]="denom.count"
                          (onInput)="onDenominationInput(denom)"
                          [min]="0" styleClass="flex-1"></p-inputNumber>
            <span class="denomination-total w-3 text-right">{{ denom.total | currency:'USD' }}</span>
          </div>
        </div>
      </div>
      <p-divider></p-divider>
      <div class="cash-summary">
        <div class="flex justify-content-between mb-2">
          <span>Fondo inicial:</span>
          <span>{{ (currentRegister?.opening_amount || 0) | currency:'USD' }}</span>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>Ventas del día:</span>
          <span>{{ (currentRegister?.total_sales || 0) | currency:'USD' }}</span>
        </div>
        <div class="flex justify-content-between mb-2 font-bold">
          <span>Total esperado:</span>
          <span>{{ ((currentRegister?.opening_amount || 0) + (currentRegister?.total_sales || 0)) | currency:'USD' }}</span>
        </div>
        <div class="flex justify-content-between mb-3 font-bold text-primary">
          <span>Total contado:</span>
          <span>{{ cashRegisterTotal | currency:'USD' }}</span>
        </div>
      </div>
      <p-button label="Cerrar Caja" icon="pi pi-lock" severity="danger" styleClass="w-full"
               (click)="closeCashRegister()"></p-button>
    </div>
  </div>
</p-dialog>

<!-- Sales History Dialog -->
<p-dialog header="Historial de Ventas" [(visible)]="showSalesHistory" [modal]="true" [style]="{width: '900px'}" *ngIf="canViewSalesHistoryCache">
  <div class="sales-history-content">
    <p-table [value]="salesHistory" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
             currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
             [globalFilterFields]="['id', 'client_name', 'total']">
      <ng-template pTemplate="caption">
        <div class="flex align-items-center justify-content-between">
          <span>Ventas del día</span>
          <p-button icon="pi pi-refresh" (click)="loadSalesHistory()" styleClass="p-button-text"></p-button>
        </div>
      </ng-template>
      <ng-template pTemplate="header">
        <tr>
          <th>ID</th>
          <th>Fecha/Hora</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Pago</th>
          <th>Acciones</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-sale>
        <tr>
          <td>{{ sale.id }}</td>
          <td>{{ sale.date_time | date:'short' }}</td>
          <td>{{ sale.client_name || 'Sin cliente' }}</td>
          <td>{{ sale.total | currency:'USD' }}</td>
          <td>{{ getPaymentMethodLabel(sale.payment_method) }}</td>
          <td>
            <p-button icon="pi pi-print" styleClass="p-button-text p-button-sm" (click)="reprintTicket(sale)" pTooltip="Reimprimir ticket"></p-button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center p-4">
            <i class="pi pi-shopping-cart text-4xl text-300 mb-2 block"></i>
            <p class="text-xl text-600 m-0">No hay ventas registradas para hoy</p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</p-dialog>

<!-- Employee Earnings Dialog -->
<p-dialog header="Mis Ganancias" [(visible)]="showEarnings" [modal]="true" [style]="{width: '600px'}" *ngIf="canViewEarningsCache">arnings()">
  <div class="earnings-content">
    <div class="earnings-summary grid mb-4">
      <div class="col-6">
        <div class="stat-card bg-green-50 border-round p-4 text-center">
          <i class="pi pi-calendar text-3xl text-green-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-green-800">{{ currentPeriodEarnings | currency:'USD' }}</div>
          <div class="text-sm text-green-600">Quincena Actual</div>
        </div>
      </div>
      <div class="col-6">
        <div class="stat-card bg-blue-50 border-round p-4 text-center">
          <i class="pi pi-chart-bar text-3xl text-blue-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-blue-800">{{ totalEarningsThisMonth | currency:'USD' }}</div>
          <div class="text-sm text-blue-600">Total del Mes</div>
        </div>
      </div>
    </div>

    <div class="earnings-info p-3 bg-yellow-50 border-round mb-3">
      <div class="flex align-items-center gap-2 mb-2">
        <i class="pi pi-info-circle text-yellow-600"></i>
        <span class="font-semibold text-yellow-800">Sistema de Comisiones</span>
      </div>
      <p class="text-sm text-yellow-700 m-0">
        Tus ganancias se calculan automáticamente por cada servicio que realizas.
        El pago se realiza cada quincena según las políticas de la peluquería.
      </p>
    </div>

    <div class="earnings-note p-3 bg-blue-50 border-round" *ngIf="authService.isStylist()">
      <div class="flex align-items-center gap-2 mb-2">
        <i class="pi pi-info-circle text-blue-600"></i>
        <span class="font-semibold text-blue-800">Información</span>
      </div>
      <p class="text-sm text-blue-700 m-0">
        Solo puedes ver tus propias ganancias. Para reportes completos, contacta al administrador.
      </p>
    </div>
  </div>
</p-dialog>

  `
})
export class PosComponent implements OnInit, OnDestroy {
  // Core properties
  currentSale: Partial<Sale> = {
    discount: 0,
    paid: 0,
    payment_method: 'cash',
    client: undefined
  };

  // Constants
  private static readonly PRODUCT_CONTENT_TYPE = 27;
  private static readonly SERVICE_CONTENT_TYPE = 25;
  private static readonly SALES_HISTORY_CACHE_EXPIRY = 5 * 60 * 1000;
  private static readonly VALID_ROLES = ['Client-Staff', 'Stilista', 'Cajera'];
  private static readonly currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  // Payment-related properties
  payments: Array<{method: string, amount: number}> = [];
  currentPaymentMethod = 'cash';
  currentPaymentAmount = 0;
  showMultiplePayments = false;
  private _cachedRemainingAmount: number | null = null;
  private _cachedTotalPaid: number | null = null;
  private _cachedCashAmount: number | null = null;
  private _cachedDiscountAmount: number | null = null;
  private _lastCalculationTime: number = 0;
  private readonly CACHE_DURATION = 500;

  // Data properties
  products: ProductWithQuantity[] = [];
  services: ServiceWithQuantity[] = [];
  clients: Client[] = [];
  employees: any[] = [];
  selectedServices: ServiceWithQuantity[] = [];

  // State properties
  processing = false;
  loadingProducts = false;

  // UI state properties
  searchTerm: string = '';
  selectedCategory: string | null = null;
  filteredProducts: ProductWithQuantity[] = [];
  filteredServices: ServiceWithQuantity[] = [];
  activeTabIndex: number = 0; // Start with services tab
  isPercentageDiscount = false;

  isPosAvailable = false;
  isCheckingCashRegister = true;

  get showPosContent(): boolean {
    return !this.isCheckingCashRegister && this.isPosAvailable;
  }

  get showCashRegisterRequired(): boolean {
    return !this.isCheckingCashRegister && !this.isPosAvailable;
  }

  // Cached properties for template performance
  private _cachedCartDetails: any[] = [];
  private _cachedCartTotal: number = 0;
  private _cachedCartItemsCount: number = 0;
  private _cachedUserRoleDisplay: string = '';
  private _cachedCanProcessSales: boolean = false;
  private _cachedCanManageCashRegister: boolean = false;
  private _cachedCanViewSalesHistory: boolean = false;
  private _cachedCanViewEarnings: boolean = false;
  private _lastCacheUpdate: number = 0;
  private readonly TEMPLATE_CACHE_DURATION = 1000;

  // Cached payment calculations for template performance
  get remainingAmount(): number {
    return this.getRemainingAmount();
  }

  get totalPaid(): number {
    return this.getTotalPaid();
  }

  get changeAmount(): number {
    return this.getChangeAmount();
  }

  get discountAmount(): number {
    return this.getDiscountAmount();
  }

  get subtotalAmount(): number {
    return this.cartService.subtotal();
  }

  get canAddPayment(): boolean {
    return !!(this.currentPaymentAmount && this.currentPaymentAmount > 0 && this.remainingAmount > 0);
  }

  get cashAmount(): number {
    return this.getCashAmount();
  }

  get cashRegisterTotal(): number {
    return this.cashRegisterService.calculateTotal();
  }

  // Cached template properties
  get cartDetails(): any[] {
    if (this.isTemplateCacheValid() && this._cachedCartDetails.length > 0) {
      return this._cachedCartDetails;
    }
    this._cachedCartDetails = this.cartService.details();
    this.updateTemplateCache();
    return this._cachedCartDetails;
  }

  get cartTotal(): number {
    if (this.isTemplateCacheValid()) {
      return this._cachedCartTotal;
    }
    this._cachedCartTotal = this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount);
    this.updateTemplateCache();
    return this._cachedCartTotal;
  }

  get cartItemsCount(): number {
    if (this.isTemplateCacheValid()) {
      return this._cachedCartItemsCount;
    }
    this._cachedCartItemsCount = this.cartService.totalItems();
    this.updateTemplateCache();
    return this._cachedCartItemsCount;
  }

  get userRoleDisplay(): string {
    if (this.isTemplateCacheValid() && this._cachedUserRoleDisplay) {
      return this._cachedUserRoleDisplay;
    }
    this._cachedUserRoleDisplay = this.getUserRoleDisplay();
    this.updateTemplateCache();
    return this._cachedUserRoleDisplay;
  }

  get canProcessSalesCache(): boolean {
    if (this.isTemplateCacheValid()) {
      return this._cachedCanProcessSales;
    }
    this._cachedCanProcessSales = this.canProcessSales();
    this.updateTemplateCache();
    return this._cachedCanProcessSales;
  }

  get canManageCashRegisterCache(): boolean {
    if (this.isTemplateCacheValid()) {
      return this._cachedCanManageCashRegister;
    }
    this._cachedCanManageCashRegister = this.canManageCashRegister();
    this.updateTemplateCache();
    return this._cachedCanManageCashRegister;
  }

  get canViewSalesHistoryCache(): boolean {
    if (this.isTemplateCacheValid()) {
      return this._cachedCanViewSalesHistory;
    }
    this._cachedCanViewSalesHistory = this.canViewSalesHistory();
    this.updateTemplateCache();
    return this._cachedCanViewSalesHistory;
  }

  get canViewEarningsCache(): boolean {
    if (this.isTemplateCacheValid()) {
      return this._cachedCanViewEarnings;
    }
    this._cachedCanViewEarnings = this.canViewEarnings();
    this.updateTemplateCache();
    return this._cachedCanViewEarnings;
  }

  private isTemplateCacheValid(): boolean {
    return Date.now() - this._lastCacheUpdate < this.TEMPLATE_CACHE_DURATION;
  }

  private updateTemplateCache(): void {
    this._lastCacheUpdate = Date.now();
  }

  private clearTemplateCache(): void {
    this._cachedCartDetails = [];
    this._cachedCartTotal = 0;
    this._cachedCartItemsCount = 0;
    this._cachedUserRoleDisplay = '';
    this._cachedCanProcessSales = false;
    this._cachedCanManageCashRegister = false;
    this._cachedCanViewSalesHistory = false;
    this._cachedCanViewEarnings = false;
    this._lastCacheUpdate = 0;
  }

  // Essential POS features
  showCashRegister = false;
  currentRegister: CashRegister | null = null;

  // Sales History
  showSalesHistory = false;
  salesHistory: Sale[] = [];
  salesHistoryLoaded = false;
  salesHistoryLastLoaded = 0;

  // Employee earnings
  showEarnings = false;
  showEmployeeEarnings = false;
  employeeEarningsData: any[] = [];
  currentPeriodEarnings = 0;
  totalEarningsThisMonth = 0;



  categories: any[] = []; // Loaded from backend
  posConfig: any = {}; // Configuración desde backend

  static readonly paymentMethods = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta de Crédito', value: 'credit_card' },
    { label: 'Tarjeta de Débito', value: 'debit_card' },
    { label: 'Transferencia', value: 'transfer' }
  ];

  get paymentMethods() {
    return PosComponent.paymentMethods;
  }

  // Métodos para pagos múltiples
  addPayment() {
    if (!this.currentPaymentAmount || this.currentPaymentAmount <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Monto inválido',
        detail: 'Ingrese un monto válido para el pago'
      });
      return;
    }

    const remainingAmount = this.getRemainingAmount();
    if (this.currentPaymentAmount > remainingAmount) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Monto excesivo',
        detail: `El monto no puede exceder ${this.formatCurrency(remainingAmount)}`
      });
      return;
    }

    this.payments.push({
      method: this.currentPaymentMethod,
      amount: this.currentPaymentAmount
    });

    this.currentPaymentAmount = 0;
    this.updateTotalPaid();
  }

  removePayment(index: number) {
    this.payments.splice(index, 1);
    this.updateTotalPaid();
  }

  private updateTotalPaid() {
    this.clearAllCaches();
    this.currentSale.paid = this.getTotalPaid();
  }



  private clearAllCaches() {
    // Clear calculation cache
    this._cachedRemainingAmount = null;
    this._cachedTotalPaid = null;
    this._cachedCashAmount = null;
    this._cachedDiscountAmount = null;
    this._lastCalculationTime = 0;
    this._lastDiscountValue = 0;
    this._lastDiscountMode = false;

    // Clear template cache
    this.clearTemplateCache();
  }

  private clearCalculationCache() {
    this.clearAllCaches();
  }

  private isCacheValid(): boolean {
    return Date.now() - this._lastCalculationTime < this.CACHE_DURATION;
  }

  getRemainingAmount(): number {
    if (this._cachedRemainingAmount !== null && this.isCacheValid()) {
      return this._cachedRemainingAmount;
    }
    const total = this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount);
    const paid = this.getTotalPaid();
    this._cachedRemainingAmount = Math.max(total - paid, 0);
    this._lastCalculationTime = Date.now();
    return this._cachedRemainingAmount;
  }

  getTotalPaid(): number {
    if (this._cachedTotalPaid !== null && this.isCacheValid()) {
      return this._cachedTotalPaid;
    }
    this._cachedTotalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    this._lastCalculationTime = Date.now();
    return this._cachedTotalPaid;
  }

  getCashAmount(): number {
    if (this._cachedCashAmount !== null && this.isCacheValid()) {
      return this._cachedCashAmount;
    }
    this._cachedCashAmount = this.payments
      .filter(payment => payment.method === 'cash')
      .reduce((sum, payment) => sum + payment.amount, 0);
    this._lastCalculationTime = Date.now();
    return this._cachedCashAmount;
  }

  toggleMultiplePayments() {
    this.showMultiplePayments = !this.showMultiplePayments;
    if (this.showMultiplePayments) {
      // Convertir pago simple a múltiple
      if (this.currentSale.paid && this.currentSale.paid > 0) {
        this.payments = [{
          method: this.currentSale.payment_method || 'cash',
          amount: this.currentSale.paid
        }];
      }
    } else {
      // Convertir múltiple a simple
      this.currentSale.paid = this.getTotalPaid();
      this.currentSale.payment_method = this.payments.length > 0 ? this.payments[0].method : 'cash';
      this.payments = [];
    }
  }

  getChangeAmount(): number {
    const total = this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount);
    const paid = this.showMultiplePayments ? this.getTotalPaid() : (this.currentSale.paid || 0);
    return paid - total;
  }

  canProcessSaleWithPayments(): boolean {
    if (!this.cartService.details().length) return false;

    const total = this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount);
    const paid = this.showMultiplePayments ? this.getTotalPaid() : (this.currentSale.paid || 0);

    return paid >= total;
  }

  private cartSubscription: Subscription = new Subscription();

  /**
   * Angular dependency injection for services used in POS component.
   */
  constructor(
    private posService: PosService,
    private clientsService: ClientsService,
    private servicesService: ServicesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public cartService: CartService,
    public cashRegisterService: CashRegisterService,
    public printService: PrintService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.canAccessPOS()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso Denegado',
        detail: 'No tienes permisos para acceder al sistema POS'
      });
      return;
    }

    this.loadPosConfig();
    this.loadCategories();
    this.loadClients();
    this.loadEmployees();
    this.loadServices();
    this.loadProducts();
    this.subscribeToCartMessages();
    this.checkCashRegisterStatus();
    this.loadEmployeeEarnings();
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    if (this.filterItemsTimeout) {
      clearTimeout(this.filterItemsTimeout);
    }
  }

  subscribeToCartMessages() {
    this.cartSubscription.add(this.cartService.messages$.subscribe(message => {
      this.messageService.add(message);
    }));
  }

  loadClients() {
    this.clientsService.getClients().subscribe({
      next: res => {
        this.clients = res.results || res;
      },
      error: (error) => {
        console.error('Error loading clients:', ErrorUtil.sanitizeForLog(String(error)));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar clientes' });
      }
    });
  }

  loadEmployees() {
    this.http.get<any>(`${environment.apiUrl}/employees/employees/`).subscribe({
      next: res => {
        this.employees = res.results || res;
      },
      error: (error) => {
        console.error('Error loading employees:', ErrorUtil.sanitizeForLog(String(error)));
        this.loadUsersAsEmployees();
      }
    });
  }

  loadUsersAsEmployees() {
    this.http.get<any>(`${environment.apiUrl}/auth/users/`).subscribe({
      next: res => {
        const users = res.results || res;
        this.employees = users.filter((u: any) => {
          if (!u.roles) return false;
          return u.roles.some((r: any) => PosComponent.VALID_ROLES.includes(r?.name));
        });
      },
      error: (error) => {
        console.error('Error loading users as employees:', ErrorUtil.sanitizeForLog(String(error)));
        this.employees = [];
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los empleados' });
      }
    });
  }

  loadServices() {
    this.servicesService.getServices({ is_active: true }).subscribe({
      next: res => {
        this.services = (res.results || res).map((s: any) => ({ ...s, quantity: 1 }));
        this.filterItems();
      },
      error: (error) => {
        console.error('Error loading services:', ErrorUtil.sanitizeForLog(String(error)));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar servicios' });
      }
    });
  }

  loadProducts() {
    this.loadingProducts = true;
    this.posService.getProducts({ is_active: true }).subscribe({
      next: res => {
        this.products = (res.results || res).map((p: any) => ({
          ...p,
          quantity: 1,
          stock: p.stock || 0,
          description: p.description === null ? undefined : p.description,
          image: p.image || null
        }));
        this.filterItems();
      },
      error: (error) => {
        console.error('Error loading products from POS service:', ErrorUtil.sanitizeForLog(String(error)));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos' });
      }
    }).add(() => {
      this.loadingProducts = false;
    });
  }

  private _lastFilterState: { searchTerm: string; selectedCategory: string | null; productsLength: number; servicesLength: number } = {
    searchTerm: '',
    selectedCategory: null,
    productsLength: 0,
    servicesLength: 0
  };
  private _cachedFilteredProducts: ProductWithQuantity[] = [];
  private _cachedFilteredServices: ServiceWithQuantity[] = [];

  private filterProducts(searchTerm: string): ProductWithQuantity[] {
    if (!this.products.length) return [];
    return this.products.filter(item => this.matchesFilter(item, searchTerm));
  }

  private filterServices(searchTerm: string): ServiceWithQuantity[] {
    if (!this.services.length) return [];
    return this.services.filter(item => this.matchesFilter(item, searchTerm));
  }

  private matchesFilter(item: FilterableItem, searchTerm: string): boolean {
    const matchesSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      (item.description && item.description.toLowerCase().includes(searchTerm));
    const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
    return !!matchesSearch && !!matchesCategory;
  }

  private filterItemsTimeout: any = null;

  filterItems() {
    const searchTerm = this.searchTerm?.toLowerCase() || '';
    const currentState = {
      searchTerm,
      selectedCategory: this.selectedCategory,
      productsLength: this.products.length,
      servicesLength: this.services.length
    };

    // Early return if no changes
    if (this._lastFilterState.searchTerm === currentState.searchTerm &&
        this._lastFilterState.selectedCategory === currentState.selectedCategory &&
        this._lastFilterState.productsLength === currentState.productsLength &&
        this._lastFilterState.servicesLength === currentState.servicesLength) {
      return;
    }

    if (this.filterItemsTimeout) {
      clearTimeout(this.filterItemsTimeout);
    }

    this.filterItemsTimeout = setTimeout(() => {
      this._cachedFilteredProducts = this.filterProducts(searchTerm);
      this._cachedFilteredServices = this.filterServices(searchTerm);

      this.filteredProducts = this._cachedFilteredProducts;
      this.filteredServices = this._cachedFilteredServices;

      this._lastFilterState = currentState;
    }, 100);
  }

  private static readonly categoryColors = {
    'Corte de Cabello': '#4CAF50',
    'Barba y Bigote': '#FF9800',
    'Coloración': '#9C27B0',
    'Tratamientos': '#03A9F4',
    'Peinados': '#E91E63'
  };

  private static readonly serviceIcons = {
    'Corte de Cabello': 'pi pi-scissors',
    'Barba y Bigote': 'pi pi-user',
    'Coloración': 'pi pi-palette',
    'Tratamientos': 'pi pi-heart',
    'Peinados': 'pi pi-star'
  };

  private static readonly HIGH_STOCK_THRESHOLD = 10;
  private static readonly LOW_STOCK_THRESHOLD = 5;

  getCategoryColor(category: string | undefined | null): string {
    return PosComponent.categoryColors[category as keyof typeof PosComponent.categoryColors] || '#607D8B';
  }

  getServiceIcon(category: string | undefined | null): string {
    return PosComponent.serviceIcons[category as keyof typeof PosComponent.serviceIcons] || 'pi pi-scissors';
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > PosComponent.HIGH_STOCK_THRESHOLD) return 'success';
    if (stock > PosComponent.LOW_STOCK_THRESHOLD) return 'warn';
    return 'danger';
  }

  trackByProductId(index: number, product: ProductWithQuantity): number {
    return product.id;
  }

  addProductToCart(product: ProductWithQuantity) {
    const stock = product.stock || 0;
    if (stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin stock',
        detail: 'Este producto no tiene stock disponible'
      });
      return;
    }

    this.cartService.addItem({
      item_type: 'product',
      object_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock
    });
  }

  addSelectedServices() {
    if (!this.selectedServices?.length) return;

    this.selectedServices.forEach(service => {
      this.cartService.addItem({
        item_type: 'service',
        object_id: service.id ?? 0,
        name: service.name,
        price: service.price ?? 0,
        quantity: 1
      });
    });
    this.selectedServices = [];
  }

  confirmProcessSale() {
    this.confirmationService.confirm({
      message: '¿Está seguro de procesar la venta?',
      accept: () => {
        this.processSale();
      }
    });
  }

  // Math exposed for template usage
  Math = Math;

  private _cachedTotalCashAmount: number | null = null;
  private _lastRegisterId: number | null = null;

  get totalCashAmount(): number {
    if (!this.currentRegister) {
      this._cachedTotalCashAmount = 0;
      this._lastRegisterId = null;
      return 0;
    }
    if (
      this._cachedTotalCashAmount !== null &&
      this._lastRegisterId === this.currentRegister.id &&
      this._cachedTotalCashAmount ===
        (this.currentRegister.opening_amount || 0) + (this.currentRegister.total_sales || 0)
    ) {
      return this._cachedTotalCashAmount;
    }
    this._cachedTotalCashAmount =
      (this.currentRegister.opening_amount || 0) + (this.currentRegister.total_sales || 0);
    this._lastRegisterId = this.currentRegister.id ?? null;
    return this._cachedTotalCashAmount;
  }

  getDiscountAmount(): number {
    const currentDiscount = this.currentSale.discount || 0;
    const currentMode = this.isPercentageDiscount;

    if (this._cachedDiscountAmount !== null && this.isCacheValid() &&
        this._lastDiscountValue === currentDiscount && this._lastDiscountMode === currentMode) {
      return this._cachedDiscountAmount;
    }

    const subtotal = this.cartService.subtotal();

    if (currentMode) {
      const validDiscount = Math.min(Math.max(currentDiscount, 0), 100);
      this._cachedDiscountAmount = subtotal * (validDiscount / 100);
    } else {
      this._cachedDiscountAmount = Math.min(Math.max(currentDiscount, 0), subtotal);
    }

    this._lastCalculationTime = Date.now();
    this._lastDiscountValue = currentDiscount;
    this._lastDiscountMode = !!currentMode;
    return this._cachedDiscountAmount;
  }

  private _lastDiscountValue: number = 0;
  private _lastDiscountMode: boolean = false;

  private sanitizeString(input: string): string {
    if (!input) return '';
    return input.replace(/[\r\n\t]/g, ' ').trim();
  }

  private isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
  }

  private formatCurrency(amount: number): string {
    return PosComponent.currencyFormatter.format(amount);
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.detail) {
      return this.sanitizeString(error.error.detail);
    }
    if (error?.error?.message) {
      return this.sanitizeString(error.error.message);
    }
    if (error?.message) {
      return this.sanitizeString(error.message);
    }
    return 'Ha ocurrido un error inesperado';
  }

  private static readonly paymentMethodLabels: {[key: string]: string} = {
    'cash': 'Efectivo',
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'transfer': 'Transferencia'
  };

  getPaymentMethodLabel(method: string): string {
    return PosComponent.paymentMethodLabels[method] || 'Desconocido';
  }

  checkCashRegisterStatus() {
    this.isCheckingCashRegister = true;

    this.posService.getCurrentCashRegister().subscribe({
      next: (register) => {
        if (register?.is_open) {
          this.currentRegister = register;
          this.isPosAvailable = true;
        } else {
          this.requireCashRegisterOpen();
        }
        this.isCheckingCashRegister = false;
      },
      error: (error) => {
        console.error('Error checking cash register status:', ErrorUtil.sanitizeForLog(String(error)));
        this.messageService.add({
          severity: 'error',
          summary: 'Error de conexión',
          detail: 'No se pudo verificar el estado de la caja registradora'
        });
        this.requireCashRegisterOpen();
        this.isCheckingCashRegister = false;
      }
    });
  }

  private requireCashRegisterOpen() {
    this.currentRegister = null;
    this.isPosAvailable = false;
    this.showCashRegister = true;
  }

  openCashRegister(amount: number) {
    if (!this.canManageCashRegister()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para abrir la caja registradora'
      });
      return;
    }

    if (!this.isValidAmount(amount)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Monto inválido',
        detail: 'El monto inicial debe ser mayor o igual a 0'
      });
      return;
    }

    this.posService.openCashRegister(amount).subscribe({
      next: (register) => {
        this.currentRegister = {
          ...register,
          opening_amount: amount,
          total_sales: 0,
          is_open: true
        };

        this.cashRegisterService.openRegister(amount);
        this.showCashRegister = false;
        this.isPosAvailable = true;
        this.isCheckingCashRegister = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Caja abierta',
          detail: `Fondo inicial: ${this.formatCurrency(amount)}`
        });
      },
      error: (error) => {
        const errorMessage = this.getErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al abrir caja',
          detail: errorMessage
        });
      }
    });
  }

  closeCashRegister() {
    if (!this.canManageCashRegister()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para cerrar la caja registradora'
      });
      return;
    }

    if (!this.currentRegister || !this.currentRegister.is_open) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay caja abierta para cerrar'
      });
      return;
    }

    const totalCounted = this.cashRegisterService.calculateTotal();
    const registerId = this.currentRegister.id;
    if (!registerId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de caja registradora no válido'
      });
      return;
    }

    this.posService.closeCashRegister(registerId, totalCounted).subscribe({
      next: () => {
        this.handleSuccessfulCashRegisterClose(totalCounted);
      },
      error: (error) => {
        const errorMessage = this.getErrorMessage(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cerrar caja',
          detail: errorMessage
        });
      }
    });
  }

  private handleSuccessfulCashRegisterClose(totalCounted: number) {
    this.cashRegisterService.closeRegister(totalCounted);
    this.printService.printCashRegisterReport(this.currentRegister!, this.cashRegisterService.denominations);

    this.currentRegister = null;
    this.isPosAvailable = false;
    this.isCheckingCashRegister = false;
    this.currentSale.paid = 0;

    this.messageService.add({
      severity: 'success',
      summary: 'Caja cerrada',
      detail: 'Reporte impreso. POS bloqueado hasta nueva apertura.'
    });

    this.showCashRegister = true;
  }

  openSalesHistory() {
    if (!this.canViewSalesHistory()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para ver el historial de ventas'
      });
      return;
    }

    this.showSalesHistory = true;

    const now = Date.now();
    const cacheExpiry = PosComponent.SALES_HISTORY_CACHE_EXPIRY;

    if (!this.salesHistoryLoaded || (now - this.salesHistoryLastLoaded) > cacheExpiry) {
      this.loadSalesHistory();
    }
  }

  loadSalesHistory() {
    const today = new Date().toISOString().split('T')[0];
    this.posService.getSales({ date: today }).subscribe({
      next: (res) => {
        this.salesHistory = res.results || res;
        this.salesHistoryLoaded = true;
        this.salesHistoryLastLoaded = Date.now();
      },
      error: (error) => {
        const errorMessage = this.getErrorMessage(error);
        this.salesHistoryLoaded = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar historial',
          detail: errorMessage
        });
      }
    });
  }

  reprintTicket(sale: Sale) {
    this.printService.printReceipt(sale);
    this.messageService.add({ severity: 'success', summary: 'Ticket reimpreso', detail: 'El ticket ha sido enviado a la impresora' });
  }

  // Métodos de permisos basados en roles
  canAccessPOS(): boolean {
    return this.authService.canAccessPOS();
  }

  canManageCashRegister(): boolean {
    return this.authService.canManageCashRegister();
  }

  canViewEarnings(): boolean {
    return this.authService.canViewOwnEarnings() || this.authService.canViewAllEarnings();
  }

  canViewSalesHistory(): boolean {
    return this.authService.canViewSalesHistory();
  }

  canProcessSales(): boolean {
    return this.authService.canProcessSales();
  }

  isEmployeeRole(): boolean {
    return this.authService.isStylist();
  }

  getUserRoleDisplay(): string {
    if (this.authService.isClientAdmin()) return 'Administrador';
    if (this.authService.isCashier()) return 'Cajera';
    if (this.authService.isStylist()) return 'Estilista';
    if (this.authService.isUtility()) return 'Auxiliar';
    return 'Usuario';
  }

  loadEmployeeEarnings() {
    if (!this.canViewEarnings()) return;

    // Cargar ganancias reales del backend
    this.posService.getCurrentFortnightEarnings().subscribe({
      next: (response) => {
        this.currentPeriodEarnings = response.total || 0;
      },
      error: (error) => {
        console.error('Error loading fortnight earnings:', ErrorUtil.sanitizeForLog(String(error)));
        this.currentPeriodEarnings = 0;
      }
    });

    this.posService.getMyEarnings().subscribe({
      next: (earnings) => {
        this.totalEarningsThisMonth = this.calculateMonthlyEarnings(earnings);
      },
      error: (error) => {
        console.error('Error loading monthly earnings:', ErrorUtil.sanitizeForLog(String(error)));
        this.totalEarningsThisMonth = 0;
      }
    });
  }

  private calculateMonthlyEarnings(earnings: any[]): number {
    const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    let total = 0;

    for (const earning of earnings) {
      if (earning.date_earned?.slice(0, 7) === currentYearMonth) {
        total += Number(earning.amount) || 0;
      }
    }

    return total;
  }

  loadCategories() {
    this.posService.getPosCategories().subscribe({
      next: (response) => {
        this.categories = response.results || [];
      },
      error: (error) => {
        console.error('Error loading categories:', ErrorUtil.sanitizeForLog(String(error)));
        this.categories = [{ name: 'Todas', value: '' }];
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se pudieron cargar las categorías' });
      }
    });
  }

  loadPosConfig() {
    this.posService.getPosConfig().subscribe({
      next: (config) => {
        this.posConfig = config;
        if (config.cash_denominations) {
          this.cashRegisterService.denominations = config.cash_denominations;
        }
      },
      error: (error) => {
        console.error('Error loading POS config:', ErrorUtil.sanitizeForLog(String(error)));
        this.posConfig = {};
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se pudo cargar la configuración del POS' });
      }
    });
  }

  processSale() {
    if (!this.canProcessSales()) {
      this.showPermissionError('No tienes permisos para procesar ventas');
      return;
    }

    if (!this.validateSaleConditions()) {
      return;
    }

    this.processing = true;
    const saleData = this.prepareSaleData();

    this.posService.createSale(saleData as any).subscribe({
      next: (response) => this.handleSuccessfulSale(response, saleData.total),
      error: (error) => this.handleSaleError(error)
    });
  }

  private showPermissionError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Sin permisos',
      detail
    });
  }

  private validateSaleConditions(): boolean {
    if (!this.currentRegister?.is_open) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Caja cerrada',
        detail: 'Debe abrir la caja registradora primero'
      });
      if (this.canManageCashRegister()) {
        this.showCashRegister = true;
      }
      return false;
    }

    if (!this.cartService.canProcessSale(this.currentSale.paid || 0, this.currentSale.discount || 0, this.isPercentageDiscount)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Venta inválida',
        detail: 'Revisa el carrito y el monto pagado'
      });
      return false;
    }

    return true;
  }

  /**
   * Prepares the sale data object to be sent to the backend.
   * Extracts details and payments using helper methods for clarity.
   */
  private prepareSaleData() {
    const details = this.mapSaleDetails();
    const subtotal = this.cartService.subtotal();
    const discountAmount = this.getDiscountAmount();
    const total = subtotal - discountAmount;
    const paid = this.showMultiplePayments ? this.getTotalPaid() : (this.currentSale.paid ?? 0);
    const paymentsData = this.mapPayments(paid);

    return {
      client: this.currentSale.client,
      details,
      payments: paymentsData,
      total: Math.max(total, 0),
      discount: discountAmount,
      paid,
      payment_method: this.showMultiplePayments ? 'mixed' : (this.currentSale.payment_method ?? 'cash'),
      tenant_id: this.getCurrentTenantId()
    };
  }

  /**
   * Maps cart details to the format required for sale submission.
   */
  private mapSaleDetails(): Array<{
    content_type: number;
    object_id: number;
    name: string;
    quantity: number;
    price: number;
    employee_id: number | null;
  }> {
    return this.cartService.details().map(item => ({
      content_type: item.item_type === 'product'
        ? PosComponent.PRODUCT_CONTENT_TYPE
        : PosComponent.SERVICE_CONTENT_TYPE,
      object_id: item.object_id,
      name: this.sanitizeString(item.name),
      quantity: item.quantity,
      price: item.price,
      employee_id: item.item_type === 'service'
        ? this.getValidEmployeeId((item as any).employee_id || this.getCurrentEmployeeId())
        : null
    }));
  }

  /**
   * Maps payment information for the sale.
   */
  private mapPayments(paid: number): Array<{ method: string; amount: number }> {
    if (this.showMultiplePayments && this.payments.length > 0) {
      return this.payments;
    }
    return [{
      method: this.currentSale.payment_method ?? 'cash',
      amount: paid
    }];
  }

  private getCurrentTenantId(): number {
    const user = this.authService.getCurrentUser();
    return user?.tenant_id || 1;
  }

  private getCurrentEmployeeId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;

    const employeeId = user.employee_id ?? user.id ?? null;
    if (employeeId === undefined || employeeId === null) return null;

    try {
      const result = EmployeeIdUtil.toUserId(employeeId, this.employees);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error('Error converting employee ID:', ErrorUtil.sanitizeForLog(String(error)));
      return null;
    }
  }

  private getValidEmployeeId(employeeId: any): number | null {
    if (employeeId === undefined || employeeId === null) return null;

    try {
      const result = EmployeeIdUtil.toUserId(employeeId, this.employees);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error('Error validating employee ID:', ErrorUtil.sanitizeForLog(String(error)));
      return null;
    }
  }

  private handleSuccessfulSale(response: Sale, saleTotal: number) {
    this.updateCashRegister(saleTotal);
    this.printService.printReceipt(response);
    this.notifyEmployeeEarnings(response);
    this.resetSaleState();

    this.messageService.add({
      severity: 'success',
      summary: 'Venta exitosa',
      detail: 'Venta procesada correctamente'
    });
  }

  private notifyEmployeeEarnings(sale: Sale) {
    const serviceDetails = this.getServiceDetails(sale);
    if (!serviceDetails.length) return;

    this.processServiceEarnings(serviceDetails, sale.id);
    this.showEarningsNotification(serviceDetails);
  }

  private getServiceDetails(sale: Sale) {
    return sale.details?.filter(detail => detail.item_type === 'service') || [];
  }

  private processServiceEarnings(serviceDetails: any[], saleId: number | undefined) {
    serviceDetails.forEach(service => {
      if (service.employee_id) {
        this.generateEarningForService(service, saleId);
      }
    });
  }

  private showEarningsNotification(serviceDetails: any[]) {
    if (this.isEmployeeRole()) {
      const totalEarnings = serviceDetails.reduce((sum, service) => sum + (service.price * service.quantity), 0);
      const serviceNames = serviceDetails.map(s => s.name).join(', ');

      this.messageService.add({
        severity: 'success',
        summary: '💰 ¡Nueva ganancia registrada!',
        detail: `+${this.formatCurrency(totalEarnings)} por: ${serviceNames}`,
        life: 8000
      });

      this.currentPeriodEarnings += totalEarnings;
    }
  }

  private generateEarningForService(service: any, saleId: number | undefined) {
    if (!saleId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudo generar la ganancia: ID de venta no válido'
      });
      return;
    }

    const commissionPercentage = this.posConfig.default_commission_percentage || 15;
    const earningData = {
      employee: service.employee_id,
      sale: saleId,
      service_name: this.sanitizeString(service.name),
      commission_percentage: commissionPercentage,
      commission_amount: service.price * service.quantity * (commissionPercentage / 100)
    };

    this.http.post(`${environment.apiUrl}/employees/earnings/`, earningData).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error generating earning:', ErrorUtil.sanitizeForLog(String(error)));
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudo registrar la ganancia del empleado'
        });
      }
    });
  }

  private handleSaleError(error: any) {
    const errorMessage = this.getErrorMessage(error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error en venta',
      detail: errorMessage
    });
    this.processing = false;
  }

  private updateCashRegister(saleTotal: number) {
    const cashAmount = this.showMultiplePayments ? this.getCashAmount() :
      (this.currentSale.payment_method === 'cash' ? this.currentSale.paid || 0 : 0);

    this.cashRegisterService.addSale(cashAmount);
    if (this.currentRegister) {
      this.currentRegister.total_sales = (this.currentRegister.total_sales ?? 0) + (cashAmount ?? 0);
    }
  }

  private resetSaleState() {
    this.cartService.clearCart();
    this.currentSale = { discount: 0, paid: 0, payment_method: 'cash' };
    this.payments = [];
    this.currentPaymentAmount = 0;
    this.showMultiplePayments = false;
    this.processing = false;
    this.salesHistoryLoaded = false;
    this.clearAllCaches();
  }

  getEmployeeId(detail: any): number | null {
    return detail.employee_id || null;
  }

  setEmployeeId(detail: any, employeeId: number | null): void {
    detail.employee_id = employeeId;
  }

  onOpenCashRegister(): void {
    this.showCashRegister = true;
  }

  trackByDenominationValue(index: number, denom: Denomination): string {
    return `${denom.value}_${index}`;
  }

  onDenominationInput(denom: Denomination): void {
    if (denom._lastCount !== denom.count) {
      this.cashRegisterService.updateDenomination(denom.value, denom.count);
      denom._lastCount = denom.count;
    }
  }
}

