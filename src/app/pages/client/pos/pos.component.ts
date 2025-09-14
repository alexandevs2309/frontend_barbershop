// pos.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

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
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { PosService, Sale, SaleDetail } from './pos.service';
import { ClientsService, Client } from '../clients/clients.service';
import { ServicesService, Service } from '../services/services.service';
import { CartService } from '../../service/cart.service';
import { CashRegisterService, CashRegister } from './cash-register.service';
import { PrintService } from './print.service';
import { BarcodeService } from './barcode.service';
import { KeyboardService } from './keyboard.service';
import { StorageService } from './storage.service';
import { OfflineService } from './offline.service';
import { SyncService } from './sync.service';

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

@Component({
  selector: 'app-pos',
  standalone: true,
  styleUrls: ['./pos.component.scss'],
  imports: [
    CommonModule, FormsModule, TabViewModule, CardModule, ButtonModule,
    InputNumberModule, MultiSelectModule, TableModule, ToastModule, TagModule,
    DropdownModule, InputTextModule, DividerModule, BadgeModule, SkeletonModule,
    ConfirmDialogModule, ToggleSwitchModule, DialogModule, CheckboxModule, AccordionModule
  ],
  providers: [MessageService, ConfirmationService, CartService, CashRegisterService, PrintService, BarcodeService, KeyboardService, StorageService, OfflineService, SyncService],
  template: `
<div class="pos-container min-h-screen bg-gray-50">
  <div class="header-section bg-white shadow-sm border-bottom-2 surface-border p-4">
    <div class="flex align-items-center justify-content-between">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-cut text-4xl text-primary"></i>
        <div>
          <h1 class="text-3xl font-bold text-900 m-0">Sistema POS</h1>
          <p class="text-600 m-0">Punto de Venta Profesional</p>
        </div>
      </div>
      <div class="flex align-items-center gap-3">
        <div class="toolbar-buttons flex gap-2">
          <p-button
            icon="pi pi-chart-line"
            label="Dashboard"
            severity="success"
            (click)="showDashboard = true"
            size="small">
          </p-button>
          <p-button
            icon="pi pi-bell"
            [label]="notifications.length ? notifications.length.toString() : 'Alertas'"
            [severity]="notifications.length ? 'warn' : 'secondary'"
            (click)="showNotifications = true"
            size="small">
          </p-button>
          <p-button
            icon="pi pi-qrcode"
            [label]="isListeningBarcode ? 'Detener Scanner' : 'Scanner'"
            [severity]="isListeningBarcode ? 'danger' : 'secondary'"
            (click)="toggleBarcodeScanning()"
            size="small">
          </p-button>
          <p-button
            icon="pi pi-calculator"
            label="Caja"
            severity="info"
            (click)="showCashRegister = true"
            size="small">
          </p-button>
          <p-button
            icon="pi pi-question-circle"
            label="Ayuda (F1)"
            severity="help"
            (click)="showShortcuts = true"
            size="small">
          </p-button>
        </div>
        <div class="text-right">
          <div class="flex align-items-center gap-2 mb-1">
            <i class="pi" [ngClass]="{
              'pi-wifi text-green-500': offlineService.isOnline(),
              'pi-wifi-slash text-red-500': !offlineService.isOnline()
            }" [title]="offlineService.isOnline() ? 'En línea' : 'Sin conexión'"></i>
            <i class="pi pi-sync"
               [ngClass]="(syncService.syncStatus$ | async) ? 'text-blue-500 pi-spin' : 'text-gray-400'"
               title="Sincronización"></i>
            <span class="text-xs text-500">Terminal: {{ syncService.getTerminalId().slice(-4) }}</span>
          </div>
          <div class="text-sm text-600">Ventas del día</div>
          <div class="text-2xl font-bold text-green-600">{{ (currentRegister?.total_sales || 0) | currency:'USD' }}</div>
          <div class="text-xs text-500" *ngIf="currentRegister">
            Caja {{ currentRegister.is_open ? 'Abierta' : 'Cerrada' }}
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
                       placeholder="Buscar productos y servicios... (F3)"
                       class="w-full" />
              </span>
            </div>
            <div class="barcode-input" *ngIf="isListeningBarcode">
              <span class="p-input-icon-left w-full">
                <i class="pi pi-qrcode text-orange-500"></i>
                <input type="text"
                       name="barcodeInput"
                       pInputText
                       [(ngModel)]="barcodeInput"
                       placeholder="Escanee código de barras..."
                       class="w-full border-orange-300" />
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

                      <div class="stock-badge absolute top-0 right-0 m-2">
                        <p-badge
                          [value]="product.stock || 0"
                          [severity]="getStockSeverity(product.stock || 0)"
                          [title]="'Stock disponible: ' + (product.stock || 0)">
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
                        [disabled]="(product.stock || 0) === 0"
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
              [value]="cartService.totalItems()"
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
          <div *ngFor="let detail of cartService.details()"
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

          <div *ngIf="!cartService.details().length" class="empty-cart text-center p-6">
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
                <span class="font-bold">{{ cartService.subtotal() | currency:'USD' }}</span>
              </div>
              <div class="flex justify-content-between align-items-center">
                <span class="text-2xl font-bold text-primary">TOTAL:</span>
                <span class="text-2xl font-bold text-primary">{{ cartService.total(currentSale.discount ?? 0, isPercentageDiscount) | currency:'USD' }}</span>
              </div>
            </div>

            <!-- Collapsible Sections -->
            <p-accordion [multiple]="true" styleClass="w-full">
              <!-- Discount Section -->
              <p-accordionTab header="Descuentos y Promociones" [selected]="(currentSale.discount || 0) > 0 || appliedPromotions.length > 0">
                <div class="discount-section mb-3">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <label class="text-sm font-semibold">
                      Descuento
                      <span class="text-xs text-500 ml-1">
                        (máx: {{ isPercentageDiscount ? '100%' : (cartService.subtotal() | currency:'USD') }})
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
                    [max]="isPercentageDiscount ? 100 : cartService.subtotal()"
                    styleClass="w-full"
                    [placeholder]="isPercentageDiscount ? '0' : '0.00'">
                  </p-inputNumber>
                </div>

                <!-- Loyalty Program -->
                <div class="loyalty-section mb-3" *ngIf="getSelectedClient()">
                  <div class="bg-purple-50 border-round p-3">
                    <div class="flex justify-content-between align-items-center mb-2">
                      <span class="font-semibold text-purple-800">Puntos: {{ customerPoints }}</span>
                      <span class="text-sm text-green-600">+{{ pointsToEarn }} pts</span>
                    </div>
                    <p-button label="Usar Puntos ({{ loyaltyDiscount | currency:'USD' }})"
                             icon="pi pi-star"
                             styleClass="p-button-outlined p-button-sm w-full"
                             [disabled]="customerPoints < 100"
                             (click)="applyLoyaltyDiscount()"></p-button>
                  </div>
                </div>

                <!-- Active Promotions -->
                <div class="promotions-section" *ngIf="appliedPromotions.length > 0">
                  <label class="block text-sm font-semibold mb-2">Promociones Aplicadas</label>
                  <div class="promotion-item p-2 border-round mb-1 bg-green-50"
                       *ngFor="let promo of appliedPromotions">
                    <div class="flex justify-content-between align-items-center">
                      <span class="text-sm font-semibold text-green-800">{{ promo.name }}</span>
                      <span class="text-sm text-green-600">-{{ promo.discount | currency:'USD' }}</span>
                    </div>
                  </div>
                </div>
              </p-accordionTab>

              <!-- Payment Section -->
              <p-accordionTab header="Pago" [selected]="true">
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

                <!-- Multiple Payments -->
                <div class="multiple-payments mb-3" *ngIf="multiplePayments.length > 0">
                  <label class="block text-sm font-semibold mb-2">Pagos Registrados</label>
                  <div class="payment-list">
                    <div class="flex justify-content-between align-items-center p-2 border-round mb-1 bg-blue-50"
                         *ngFor="let payment of multiplePayments; let i = index">
                      <span class="text-sm">{{ getPaymentMethodLabel(payment.method) }}: {{ payment.amount | currency:'USD' }}</span>
                      <p-button icon="pi pi-times"
                               styleClass="p-button-rounded p-button-text p-button-sm p-button-danger"
                               (click)="removeMultiplePayment(i)"></p-button>
                    </div>
                  </div>
                  <div class="remaining-amount text-center p-2 bg-yellow-50 border-round mb-3">
                    <span class="font-semibold">Restante: {{ remainingAmount | currency:'USD' }}</span>
                  </div>
                </div>

                <div class="paid-amount mb-3">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <label class="text-sm font-semibold">Monto Recibido</label>
                    <p-button label="+ Pago"
                             icon="pi pi-plus"
                             size="small"
                             styleClass="p-button-outlined p-button-sm"
                             (click)="addMultiplePayment()"
                             [disabled]="!currentSale.paid || currentSale.paid <= 0"></p-button>
                  </div>
                  <p-inputNumber
                    [(ngModel)]="currentSale.paid"
                    mode="currency"
                    currency="USD"
                    [min]="0"
                    styleClass="w-full"
                    placeholder="0.00">
                  </p-inputNumber>
                </div>

                <div class="change-section p-3 border-round mb-3"
                     [ngClass]="{
                       'bg-green-50 border-green-200': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) >= 0,
                       'bg-red-50 border-red-200': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) < 0
                     }">
                  <div class="flex justify-content-between align-items-center">
                    <span class="font-semibold"
                          [ngClass]="{
                            'text-green-800': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) >= 0,
                            'text-red-800': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) < 0
                          }">
                      {{ cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) >= 0 ? 'Cambio:' : 'Falta:' }}
                    </span>
                    <span class="text-xl font-bold"
                          [ngClass]="{
                            'text-green-800': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) >= 0,
                            'text-red-800': cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount) < 0
                          }">
                      {{ Math.abs(cartService.change(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount)) | currency:'USD' }}
                    </span>
                  </div>
                </div>
              </p-accordionTab>

              <!-- Quotations Section -->
              <p-accordionTab header="Cotizaciones" *ngIf="pendingSales.length > 0">
                <div class="pending-list">
                  <div class="pending-item p-2 border-round mb-1 bg-orange-50 cursor-pointer hover:bg-orange-100"
                       *ngFor="let sale of pendingSales"
                       (click)="loadQuotation(sale)">
                    <div class="flex justify-content-between align-items-center">
                      <div>
                        <div class="text-sm font-semibold">{{ sale.total | currency:'USD' }}</div>
                        <div class="text-xs text-600">{{ sale.date_time | date:'short' }}</div>
                      </div>
                      <i class="pi pi-angle-right text-orange-600"></i>
                    </div>
                  </div>
                </div>
              </p-accordionTab>
            </p-accordion>
          </div>

          <!-- Fixed Action Buttons -->
          <div class="action-buttons-fixed p-3 border-top-1 surface-border bg-white">
            <p-button
              label="Procesar Venta (Enter)"
              icon="pi pi-credit-card"
              styleClass="p-button-lg w-full mb-2 process-sale-btn"
              [disabled]="!cartService.canProcessSale(currentSale.paid || 0, currentSale.discount || 0, isPercentageDiscount)"
              [loading]="processing"
              (click)="confirmProcessSale()">
            </p-button>

            <div class="secondary-actions flex gap-2">
              <p-button
                label="Cotización"
                icon="pi pi-file-edit"
                styleClass="p-button-outlined flex-1"
                (click)="saveAsQuotation()"
                [disabled]="!cartService.details().length || processing">
              </p-button>
              <p-button
                label="Devolución"
                icon="pi pi-undo"
                styleClass="p-button-outlined flex-1"
                (click)="showReturns = true"
                [disabled]="processing">
              </p-button>
              <p-button
                icon="pi pi-trash"
                styleClass="p-button-outlined p-button-danger"
                (click)="cartService.clearCart()"
                [disabled]="processing"
                pTooltip="Limpiar Carrito">
              </p-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

<p-toast position="top-right"></p-toast>
<p-confirmDialog header="Confirmar Venta" icon="pi pi-exclamation-triangle"></p-confirmDialog>

<!-- Cash Register Dialog -->
<p-dialog header="Gestión de Caja" [(visible)]="showCashRegister" [modal]="true" [style]="{width: '500px'}">
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
        <div class="denomination-row" *ngFor="let denom of cashRegisterService.denominations">
          <div class="flex align-items-center gap-3 mb-2">
            <span class="denomination-value w-3">{{ denom.value | currency:'USD' }}</span>
            <p-inputNumber [(ngModel)]="denom.count"
                          (onInput)="cashRegisterService.updateDenomination(denom.value, denom.count)"
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
          <span>{{ cashRegisterService.calculateTotal() | currency:'USD' }}</span>
        </div>
      </div>
      <p-button label="Cerrar Caja" icon="pi pi-lock" severity="danger" styleClass="w-full"
               (click)="closeCashRegister()"></p-button>
    </div>
  </div>
</p-dialog>

<!-- Keyboard Shortcuts Dialog -->
<p-dialog header="Atajos de Teclado" [(visible)]="showShortcuts" [modal]="true" [style]="{width: '600px'}">
  <div class="shortcuts-content">
    <div class="shortcuts-grid">
      <div class="shortcut-item flex justify-content-between align-items-center p-2 border-bottom-1 surface-border"
           *ngFor="let shortcut of keyboardService.shortcuts">
        <span class="shortcut-description">{{ shortcut.description }}</span>
        <p-tag [value]="shortcut.key" severity="info"></p-tag>
      </div>
    </div>
  </div>
</p-dialog>

<!-- Returns Dialog -->
<p-dialog header="Devoluciones" [(visible)]="showReturns" [modal]="true" [style]="{width: '700px'}">
  <div class="returns-content">
    <div class="search-sale mb-3">
      <label class="block text-sm font-semibold text-700 mb-2">Buscar Venta</label>
      <div class="flex gap-2">
        <input type="text" 
               pInputText 
               [(ngModel)]="returnSaleId" 
               name="returnSaleId" 
               placeholder="ID de venta o teléfono cliente" 
               class="p-inputtext p-component flex-1" />
        <p-button label="Buscar" icon="pi pi-search" (click)="searchSaleForReturn()"></p-button>
      </div>
    </div>

    <div *ngIf="returnSale" class="sale-details mb-3">
      <h5>Venta #{{ returnSale.id }} - {{ returnSale.date_time | date:'short' }}</h5>
      <div class="return-items">
        <div class="return-item flex justify-content-between align-items-center p-2 border-round mb-2 bg-gray-50"
             *ngFor="let item of returnSale.details; let i = index">
          <div class="flex align-items-center gap-3">
            <p-checkbox [(ngModel)]="item.selected" binary="true"></p-checkbox>
            <div>
              <div class="font-semibold">{{ item.name }}</div>
              <div class="text-sm text-600">{{ item.price | currency:'USD' }} x {{ item.quantity }}</div>
            </div>
          </div>
          <div class="return-quantity" *ngIf="item.selected">
            <p-inputNumber [(ngModel)]="item.returnQuantity" [min]="1" [max]="item.quantity"
                          styleClass="w-4rem" [showButtons]="true"></p-inputNumber>
          </div>
        </div>
      </div>

      <div class="return-reason mb-3">
        <label class="block text-sm font-semibold text-700 mb-2">Motivo de Devolución</label>
        <p-dropdown [options]="returnReasons" [(ngModel)]="selectedReturnReason"
                   optionLabel="label" optionValue="value" styleClass="w-full"></p-dropdown>
      </div>

      <div class="return-total text-center p-3 bg-red-50 border-round">
        <span class="text-lg font-bold text-red-700">Total a devolver: {{ calculateReturnTotal() | currency:'USD' }}</span>
      </div>
    </div>
  </div>

  <ng-template pTemplate="footer">
    <p-button label="Cancelar" icon="pi pi-times" styleClass="p-button-text" (click)="showReturns = false"></p-button>
    <p-button label="Procesar Devolución" icon="pi pi-check"
             [disabled]="!returnSale || !hasSelectedItems()"
             (click)="processReturn()"></p-button>
  </ng-template>
</p-dialog>

<!-- Dashboard Dialog -->
<p-dialog header="Dashboard en Tiempo Real" [(visible)]="showDashboard" [modal]="true" [style]="{width: '900px'}">
  <div class="dashboard-content">
    <div class="stats-grid grid">
      <div class="col-3">
        <div class="stat-card bg-blue-50 border-round p-3 text-center">
          <i class="pi pi-dollar text-3xl text-blue-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-blue-800">{{ dailyStats.sales | currency:'USD' }}</div>
          <div class="text-sm text-blue-600">Ventas del Día</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-green-50 border-round p-3 text-center">
          <i class="pi pi-shopping-cart text-3xl text-green-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-green-800">{{ dailyStats.transactions }}</div>
          <div class="text-sm text-green-600">Transacciones</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-orange-50 border-round p-3 text-center">
          <i class="pi pi-chart-line text-3xl text-orange-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-orange-800">{{ dailyStats.avgTicket | currency:'USD' }}</div>
          <div class="text-sm text-orange-600">Ticket Promedio</div>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-card bg-purple-50 border-round p-3 text-center">
          <i class="pi pi-star text-3xl text-purple-600 mb-2 block"></i>
          <div class="text-2xl font-bold text-purple-800">{{ activePromotions.length }}</div>
          <div class="text-sm text-purple-600">Promociones Activas</div>
        </div>
      </div>
    </div>

    <div class="top-products mt-4">
      <h5>Productos Más Vendidos</h5>
      <div class="product-rank" *ngFor="let product of dailyStats.topProducts; let i = index">
        <div class="flex justify-content-between align-items-center p-2 border-bottom-1 surface-border">
          <div class="flex align-items-center gap-3">
            <p-badge [value]="i + 1" [severity]="i === 0 ? 'success' : i === 1 ? 'warn' : 'info'"></p-badge>
            <span class="font-semibold">{{ product.name }}</span>
          </div>
          <span class="text-600">{{ product.sold }} vendidos</span>
        </div>
      </div>
    </div>
  </div>
</p-dialog>

<!-- Notifications Dialog -->
<p-dialog header="Notificaciones y Alertas" [(visible)]="showNotifications" [modal]="true" [style]="{width: '600px'}">
  <div class="notifications-content">
    <div class="notification-item flex align-items-start gap-3 p-3 border-bottom-1 surface-border"
         *ngFor="let notification of notifications">
      <i class="{{ getNotificationIcon(notification.type) }} text-2xl"
         [ngClass]="getNotificationColor(notification.type)"></i>
      <div class="flex-1">
        <div class="font-semibold mb-1">{{ notification.title }}</div>
        <div class="text-sm text-600 mb-2">{{ notification.message }}</div>
        <div class="text-xs text-500">{{ notification.time | date:'short' }}</div>
      </div>
      <p-button icon="pi pi-times"
               styleClass="p-button-rounded p-button-text p-button-sm"
               (click)="dismissNotification(notification)"></p-button>
    </div>

    <div *ngIf="!notifications.length" class="text-center p-6">
      <i class="pi pi-bell text-6xl text-300 mb-3 block"></i>
      <p class="text-xl text-600">No hay notificaciones</p>
    </div>
  </div>
</p-dialog>
  `
})
export class PosComponent implements OnInit, OnDestroy {
  // Existing properties
  currentSale: Partial<Sale> = {
    discount: 0,
    paid: 0,
    payment_method: 'cash',
    client: undefined
  };

  products: ProductWithQuantity[] = [];
  services: ServiceWithQuantity[] = [];
  clients: Client[] = [];
  processing = false;
  selectedServices: ServiceWithQuantity[] = [];
  loadingProducts = false;

  // New properties for improvements
  searchTerm = '';
  selectedCategory: string | null = null;
  filteredProducts: ProductWithQuantity[] = [];
  filteredServices: ServiceWithQuantity[] = [];
  activeTabIndex = 1;
  isPercentageDiscount = false;

  // Advanced POS features
  showCashRegister = false;
  showShortcuts = false;
  showReturns = false;
  showDashboard = false;
  currentRegister: CashRegister | null = null;
  barcodeInput = '';
  isListeningBarcode = false;
  quickQuantity = 1;

  // Multiple payments
  multiplePayments: Array<{method: string, amount: number}> = [];
  remainingAmount = 0;

  // Quotations and pending sales
  pendingSales: Sale[] = [];
  isQuotationMode = false;

  // Returns functionality
  returnSaleId = '';
  returnSale: any = null;
  selectedReturnReason = '';
  returnReasons = [
    { label: 'Producto defectuoso', value: 'defective' },
    { label: 'No satisface expectativas', value: 'unsatisfied' },
    { label: 'Talla/medida incorrecta', value: 'wrong_size' },
    { label: 'Cambio de opinión', value: 'change_mind' },
    { label: 'Otro', value: 'other' }
  ];

  // Promotions and offers
  activePromotions: any[] = [];
  appliedPromotions: any[] = [];

  // Loyalty program
  customerPoints = 0;
  pointsToEarn = 0;
  loyaltyDiscount = 0;

  // Real-time dashboard
  dailyStats = {
    sales: 0,
    transactions: 0,
    avgTicket: 0,
    topProducts: [] as Array<{name: string, sold: number}>,
    hourlyData: [] as any[]
  };

  // Notifications
  notifications: any[] = [];
  showNotifications = false;

  categories = [
    { name: 'Todos', value: null },
    { name: 'Cuidado Capilar', value: 'hair-care' },
    { name: 'Styling', value: 'styling' },
    { name: 'Tratamientos', value: 'treatments' },
    { name: 'Accesorios', value: 'accessories' }
  ];

  paymentMethods = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta de Crédito', value: 'credit_card' },
    { label: 'Tarjeta de Débito', value: 'debit_card' },
    { label: 'Transferencia', value: 'transfer' }
  ];

  private cartSubscription: Subscription = new Subscription();

  constructor(
    private posService: PosService,
    private clientsService: ClientsService,
    private servicesService: ServicesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public cartService: CartService,
    public cashRegisterService: CashRegisterService,
    public printService: PrintService,
    private barcodeService: BarcodeService,
    public keyboardService: KeyboardService,
    private storageService: StorageService,
    public offlineService: OfflineService,
    public syncService: SyncService
  ) {}

  ngOnInit() {
    this.loadClients();
    this.loadServices();
    this.loadProducts();
    this.subscribeToCartMessages();
    this.setupAdvancedFeatures();
    this.checkCashRegisterStatus();
    this.updateDashboard();
    this.checkStockAlerts();

    // Load active promotions from backend
    this.loadActivePromotions();
  }

  setupAdvancedFeatures() {
    // Barcode scanning
    this.barcodeService.scannedCode$.subscribe(code => {
      this.handleBarcodeScanned(code);
    });

    // Keyboard shortcuts
    this.keyboardService.shortcut$.subscribe(action => {
      this.handleKeyboardShortcut(action);
    });

    // Cash register status
    this.cashRegisterService.currentRegister$.subscribe(register => {
      this.currentRegister = register;
    });
  }

  checkCashRegisterStatus() {
    if (!this.cashRegisterService.isRegisterOpen()) {
      this.showCashRegisterDialog();
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  // Subscribes to messages from the CartService
  subscribeToCartMessages() {
    this.cartSubscription.add(this.cartService.messages$.subscribe(message => {
      this.messageService.add(message);
    }));
  }

  loadClients() {
    this.clientsService.getClients().subscribe({
      next: res => this.clients = res.results || res,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar clientes' })
    });
  }

  loadServices() {
    this.servicesService.getServices({ is_active: true }).subscribe({
      next: res => {
        this.services = (res.results || res).map((s: any) => ({ ...s, quantity: 1 }));
        this.filterItems();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar servicios' })
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
        this.loadingProducts = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos' });
        this.loadingProducts = false;
      }
    });
  }

  filterItems() {
    // Filter products
    let filteredProds = [...this.products];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredProds = filteredProds.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
    }
    if (this.selectedCategory) {
      filteredProds = filteredProds.filter(p => p.category === this.selectedCategory);
    }
    this.filteredProducts = filteredProds;

    // Filter services
    let filteredServs = [...this.services];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredServs = filteredServs.filter(s => s.name.toLowerCase().includes(term) || (s.description && s.description.toLowerCase().includes(term)));
    }
    this.filteredServices = filteredServs;
  }

  getCategoryColor(category: string | undefined | null): string {
    const colors = {
      'Corte de Cabello': '#4CAF50',
      'Barba y Bigote': '#FF9800',
      'Coloración': '#9C27B0',
      'Tratamientos': '#03A9F4',
      'Peinados': '#E91E63'
    };
    return colors[category as keyof typeof colors] || '#607D8B';
  }

  getServiceIcon(category: string | undefined | null): string {
    const icons = {
      'Corte de Cabello': 'pi pi-scissors',
      'Barba y Bigote': 'pi pi-user',
      'Coloración': 'pi pi-palette',
      'Tratamientos': 'pi pi-heart',
      'Peinados': 'pi pi-star'
    };
    return icons[category as keyof typeof icons] || 'pi pi-scissors';
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 5) return 'warn';
    return 'danger';
  }

  trackByProductId(index: number, product: ProductWithQuantity): number {
    return product.id;
  }

  addProductToCart(product: ProductWithQuantity) {
    this.cartService.addItem({
      item_type: 'product',
      object_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock
    });
    this.animateItem(product.id);
    this.checkPromotions();
    this.calculateLoyaltyPoints();
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

  animateItem(id: number) {
    const element = document.getElementById('product-' + id);
    if (element) {
      element.classList.add('animate-pop');
      setTimeout(() => {
        element.classList.remove('animate-pop');
      }, 500);
    }
  }

  confirmProcessSale() {
    this.confirmationService.confirm({
      message: '¿Está seguro de procesar la venta?',
      accept: () => {
        this.processSale();
      }
    });
  }

  Math = Math;

  getSelectedClient(): Client | undefined {
    return this.clients.find(client => client.id === this.currentSale.client);
  }

  getPaymentMethodLabel(method: string): string {
    const methods: {[key: string]: string} = {
      'cash': 'Efectivo',
      'credit_card': 'Tarjeta Crédito',
      'debit_card': 'Tarjeta Débito',
      'transfer': 'Transferencia'
    };
    return methods[method] || method;
  }

  // Advanced POS Methods
  handleBarcodeScanned(code: string) {
    if (this.barcodeService.validateBarcode(code)) {
      const product = this.products.find(p => p.id.toString() === code.slice(-6));
      if (product) {
        this.addProductToCart(product);
        this.messageService.add({ severity: 'success', summary: 'Producto encontrado', detail: product.name + ' agregado' });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Producto no encontrado', detail: 'Código: ' + code });
      }
    }
  }

  handleKeyboardShortcut(action: string) {
    switch (action) {
      case 'new_sale':
        this.cartService.clearCart();
        this.currentSale = { discount: 0, paid: 0, payment_method: 'cash' };
        break;
      case 'search_product':
        document.getElementById('search-input')?.focus();
        break;
      case 'process_sale':
        if (this.cartService.canProcessSale(this.currentSale.paid || 0, this.currentSale.discount || 0, this.isPercentageDiscount)) {
          this.confirmProcessSale();
        }
        break;
      case 'clear_cart':
        this.cartService.clearCart();
        break;
      case 'cash_register':
        this.showCashRegister = true;
        break;
      case 'help':
        this.showShortcuts = true;
        break;
      case 'print_receipt':
        if (this.currentSale.id) {
          this.printService.printReceipt(this.currentSale as Sale);
        }
        break;
      default:
        if (action.startsWith('quantity_')) {
          this.quickQuantity = parseInt(action.split('_')[1]);
        }
    }
  }

  toggleBarcodeScanning() {
    this.isListeningBarcode = !this.isListeningBarcode;
    if (this.isListeningBarcode) {
      this.barcodeService.startListening();
      this.messageService.add({ severity: 'info', summary: 'Scanner activado', detail: 'Escanee un código de barras' });
    } else {
      this.barcodeService.stopListening();
    }
  }

  showCashRegisterDialog() {
    this.showCashRegister = true;
  }

  openCashRegister(amount: number) {
    this.cashRegisterService.openRegister(amount);
    this.showCashRegister = false;
    this.messageService.add({ severity: 'success', summary: 'Caja abierta', detail: 'Fondo inicial: $' + amount.toFixed(2) });
  }

  closeCashRegister() {
    const totalCounted = this.cashRegisterService.calculateTotal();
    this.cashRegisterService.closeRegister(totalCounted);
    this.printService.printCashRegisterReport(this.currentRegister, this.cashRegisterService.denominations);
    this.messageService.add({ severity: 'success', summary: 'Caja cerrada', detail: 'Reporte impreso' });
  }

  // Multiple payments methods
  addMultiplePayment() {
    if (this.currentSale.payment_method && this.currentSale.paid && this.currentSale.paid > 0) {
      this.multiplePayments.push({
        method: this.currentSale.payment_method,
        amount: this.currentSale.paid
      });

      const totalPaid = this.multiplePayments.reduce((sum, p) => sum + p.amount, 0);
      this.remainingAmount = Math.max(0, (this.cartService.total(this.currentSale.discount || 0, this.isPercentageDiscount)) - totalPaid);

      this.currentSale.paid = 0;
      this.currentSale.payment_method = 'cash';
    }
  }

  removeMultiplePayment(index: number) {
    this.multiplePayments.splice(index, 1);
    const totalPaid = this.multiplePayments.reduce((sum, p) => sum + p.amount, 0);
    this.remainingAmount = Math.max(0, (this.cartService.total(this.currentSale.discount || 0, this.isPercentageDiscount)) - totalPaid);
  }

  // Quotations methods
  saveAsQuotation() {
    const quotation = {
      ...this.currentSale,
      details: this.cartService.details(),
      total: this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount),
      date_time: new Date().toISOString(),
      closed: false,
      is_quotation: true
    } as Sale & { is_quotation: boolean };

    this.pendingSales.push(quotation);
    this.cartService.clearCart();
    this.messageService.add({ severity: 'success', summary: 'Cotización guardada', detail: 'Puede recuperarla más tarde' });
  }

  loadQuotation(quotation: Sale) {
    this.currentSale = { ...quotation };
    quotation.details?.forEach(detail => {
      this.cartService.addItem({
        item_type: detail.item_type,
        object_id: detail.object_id,
        name: detail.name,
        price: detail.price,
        quantity: detail.quantity
      });
    });

    const index = this.pendingSales.indexOf(quotation);
    if (index > -1) {
      this.pendingSales.splice(index, 1);
    }
  }

  // Returns methods
  searchSaleForReturn() {
    if (!this.returnSaleId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ingrese ID de venta o teléfono' });
      return;
    }

    this.posService.getSale(this.returnSaleId).subscribe({
      next: (sale) => {
        this.returnSale = {
          ...sale,
          details: sale.details?.map(detail => ({
            ...detail,
            selected: false,
            returnQuantity: 1
          })) || []
        };
      },
      error: () => {
        // Try searching by client phone
        this.posService.getSales({ client_phone: this.returnSaleId }).subscribe({
          next: (sales: any) => {
            const recentSales = sales.results || sales;
            if (recentSales.length > 0) {
              const sale = recentSales[0]; // Most recent sale
              this.returnSale = {
                ...sale,
                details: sale.details?.map((detail: any) => ({
                  ...detail,
                  selected: false,
                  returnQuantity: 1
                })) || []
              };
            } else {
              this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'No se encontró la venta' });
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar la venta' });
          }
        });
      }
    });
  }

  calculateReturnTotal(): number {
    if (!this.returnSale) return 0;
    return this.returnSale.details
      .filter((item: any) => item.selected)
      .reduce((sum: number, item: any) => sum + (item.price * (item.returnQuantity || 1)), 0);
  }

  hasSelectedItems(): boolean {
    return this.returnSale?.details?.some((item: any) => item.selected) || false;
  }

  processReturn() {
    const returnAmount = this.calculateReturnTotal();
    this.messageService.add({
      severity: 'success',
      summary: 'Devolución procesada',
      detail: 'Monto devuelto: ' + returnAmount.toFixed(2)
    });
    this.showReturns = false;
    this.returnSale = null;
    this.returnSaleId = '';
  }

  // Loyalty program methods
  calculateLoyaltyPoints() {
    const total = this.cartService.total(this.currentSale.discount || 0, this.isPercentageDiscount);
    this.pointsToEarn = Math.floor(total / 10); // 1 point per $10

    const client = this.getSelectedClient();
    if (client) {
      this.customerPoints = client.loyalty_points || 0;
      this.loyaltyDiscount = Math.floor(this.customerPoints / 100) * 5; // $5 per 100 points
    }
  }

  applyLoyaltyDiscount() {
    if (this.customerPoints >= 100) {
      const pointsToUse = Math.floor(this.customerPoints / 100) * 100;
      const discount = (pointsToUse / 100) * 5;

      this.currentSale.discount = (this.currentSale.discount || 0) + discount;
      this.customerPoints -= pointsToUse;

      this.messageService.add({
        severity: 'success',
        summary: 'Puntos aplicados',
        detail: 'Descuento de ' + discount.toFixed(2) + ' aplicado'
      });
    }
  }

  // Promotions methods
  checkPromotions() {
    this.appliedPromotions = [];
    const cartItems = this.cartService.details();

    // Example: Buy 2 get 1 free
    const serviceItems = cartItems.filter(item => item.item_type === 'service');
    if (serviceItems.length >= 2) {
      this.appliedPromotions.push({
        name: '2x1 en Servicios',
        discount: Math.min(...serviceItems.map(s => s.price))
      });
    }

    // Example: 10% off on products over $50
    const productTotal = cartItems
      .filter(item => item.item_type === 'product')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (productTotal > 50) {
      this.appliedPromotions.push({
        name: '10% desc. productos +$50',
        discount: productTotal * 0.1
      });
    }
  }

  // Dashboard methods
  updateDashboard() {
    this.posService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dailyStats = {
          sales: stats.total_sales || (this.currentRegister?.total_sales || 0),
          transactions: stats.total_transactions || 0,
          avgTicket: stats.average_ticket || 0,
          topProducts: stats.top_products || [],
          hourlyData: stats.hourly_data || []
        };
      },
      error: () => {
        // Fallback to cash register data only
        this.dailyStats = {
          sales: this.currentRegister?.total_sales || 0,
          transactions: 0,
          avgTicket: 0,
          topProducts: [],
          hourlyData: []
        };
      }
    });
  }

  // Notifications methods
  addNotification(type: string, title: string, message: string) {
    this.notifications.unshift({
      id: Date.now(),
      type,
      title,
      message,
      time: new Date()
    });

    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }
  }

  getNotificationIcon(type: string): string {
    const icons = {
      'warning': 'pi pi-exclamation-triangle',
      'info': 'pi pi-info-circle',
      'success': 'pi pi-check-circle',
      'error': 'pi pi-times-circle'
    };
    return icons[type as keyof typeof icons] || 'pi pi-bell';
  }

  getNotificationColor(type: string): string {
    const colors = {
      'warning': 'text-orange-600',
      'info': 'text-blue-600',
      'success': 'text-green-600',
      'error': 'text-red-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  }

  dismissNotification(notification: any) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  checkStockAlerts() {
    this.products.forEach(product => {
      if ((product.stock || 0) < 5) {
        this.addNotification('warning', 'Stock Bajo', product.name + ' tiene solo ' + (product.stock || 0) + ' unidades');
      }
    });
  }

  loadActivePromotions() {
    this.posService.getActivePromotions().subscribe({
      next: (promotions) => {
        this.activePromotions = promotions.results || promotions || [];
      },
      error: () => {
        // Fallback to hardcoded promotions if API fails
        this.activePromotions = [
          { name: '2x1 Servicios', type: 'buy_x_get_y', conditions: { buy: 2, get: 1, category: 'service' } },
          { name: '10% desc. +$50', type: 'percentage', conditions: { min_amount: 50, discount: 0.1 } }
        ];
      }
    });
  }

  // Advanced processSale with all features
  processSale() {
    if (!this.cartService.canProcessSale(this.currentSale.paid || 0, this.currentSale.discount || 0, this.isPercentageDiscount)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Revisa el carrito y el monto pagado.'
      });
      return;
    }

    this.processing = true;

    // Convertir detalles del carrito al formato esperado por el backend
    const details = this.cartService.details().map(item => ({
      content_type: item.item_type === 'product' ? 27 : 25, // IDs reales de ContentType
      object_id: item.object_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    // Crear array de pagos
    const payments = [{
      method: this.currentSale.payment_method ?? 'cash',
      amount: this.currentSale.paid ?? 0
    }];

    const saleData = {
      client: this.currentSale.client,
      details: details,
      payments: payments,
      total: this.cartService.total(this.currentSale.discount ?? 0, this.isPercentageDiscount),
      discount: this.currentSale.discount ?? 0,
      paid: this.currentSale.paid ?? 0,
      payment_method: this.currentSale.payment_method ?? 'cash'
    };

    console.log('Sending sale data:', saleData);
    this.posService.createSale(saleData as any).subscribe({
      next: (response) => {
        // Add to cash register
        this.cashRegisterService.addSale(saleData.total || 0);

        // Print receipt automatically
        this.printService.printReceipt(response);

        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: '¡Venta procesada exitosamente!' });

        // Reset everything
        this.cartService.clearCart();
        this.currentSale = { discount: 0, paid: 0, payment_method: 'cash' };
        this.processing = false;
      },
      error: (error) => {
        console.error('Sale processing error:', error);
        console.error('Error details:', error.error);
        const errorMsg = error.error?.detail || error.error?.message || 'Error al procesar la venta. Intente nuevamente.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
        this.processing = false;
      }
    });
  }
}
