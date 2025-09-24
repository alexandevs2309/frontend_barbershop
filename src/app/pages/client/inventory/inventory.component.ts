import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService, Product, StockMovement } from './inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, DropdownModule, ToastModule,
    ConfirmDialogModule, TagModule, TabViewModule, CardModule
  ],
  providers: [MessageService, ConfirmationService],
  styleUrl: './inventory.component.scss',
  template: `
    <div class="grid">
      <!-- Header -->
      <div class="col-12">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="m-0">Gestión de Inventario</h2>
          <div class="flex gap-2">
            <p-button label="Movimiento de Stock" icon="pi pi-arrow-right-arrow-left" 
                      (click)="showStockMovement()" styleClass="p-button-outlined"></p-button>
            <p-button label="Nuevo Producto" icon="pi pi-plus" (click)="openNew()"></p-button>
          </div>
        </div>
      </div>

      <!-- Alerts Cards -->
      <div class="col-12 md:col-4">
        <p-card styleClass="bg-red-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Stock Bajo</span>
              <div class="text-900 font-medium text-xl">{{ lowStockCount }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-red-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-exclamation-triangle text-red-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card styleClass="bg-blue-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Total Productos</span>
              <div class="text-900 font-medium text-xl">{{ totalProducts }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-box text-blue-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card styleClass="bg-green-100">
          <div class="flex justify-content-between align-items-start">
            <div>
              <span class="block text-500 font-medium mb-3">Valor Inventario</span>
              <div class="text-900 font-medium text-xl">{{ inventoryValue | currency:'USD' }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-500 border-round" 
                 style="width:2.5rem;height:2.5rem">
              <i class="pi pi-dollar text-green-50 text-xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Main Content -->
      <div class="col-12">
        <p-tabView>
          <!-- Products Tab -->
          <p-tabPanel>
            <ng-template pTemplate="header">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-box"></i>
                <span>Productos</span>
              </div>
            </ng-template>

            <div class="flex gap-3 mb-4">
              <span class="p-input-icon-left flex-1">
                <i class="pi pi-search"></i>
                <input pInputText [(ngModel)]="searchTerm" (input)="loadProducts()" 
                       placeholder="Buscar productos..." class="w-full">
              </span>
              <p-dropdown [options]="categoryOptions" [(ngModel)]="selectedCategory"
                        (onChange)="loadProducts()" placeholder="Todas las categorías"
                        [showClear]="true" class="w-12rem"></p-dropdown>
            </div>

            <p-table [value]="products" [loading]="loading" [paginator]="true" [rows]="10" responsiveLayout="scroll">
              <ng-template pTemplate="header">
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-product>
                <tr>
                  <td>
                    <div>
                      <div class="font-semibold">{{ product.name }}</div>
                      <div class="text-sm text-600" *ngIf="product.description">{{ product.description }}</div>
                      <div class="text-xs text-500" *ngIf="product.barcode">Código: {{ product.barcode }}</div>
                    </div>
                  </td>
                  <td>
                    <p-tag [value]="product.category || 'Sin categoría'" severity="info"></p-tag>
                  </td>
                  <td>
                    <div class="flex align-items-center gap-2">
                      <span [class]="getStockClass(product)">{{ product.stock }}</span>
                      <i class="pi pi-exclamation-triangle text-orange-500" 
                         *ngIf="product.stock <= product.min_stock" 
                         pTooltip="Stock bajo"></i>
                    </div>
                  </td>
                  <td class="font-semibold">{{ product.price | currency:'USD' }}</td>
                  <td>
                    <p-tag [value]="product.is_active ? 'Activo' : 'Inactivo'"
                           [severity]="product.is_active ? 'success' : 'danger'"></p-tag>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <p-button icon="pi pi-pencil" (click)="editProduct(product)"
                                pTooltip="Editar" styleClass="p-button-rounded p-button-text"></p-button>
                      <p-button icon="pi pi-plus" (click)="adjustStock(product)"
                                pTooltip="Ajustar Stock" styleClass="p-button-rounded p-button-success p-button-text"></p-button>
                      <p-button icon="pi pi-trash" (click)="confirmDelete(product)"
                                pTooltip="Eliminar" styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center">No hay productos registrados</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>

          <!-- Stock Movements Tab -->
          <p-tabPanel>
            <ng-template pTemplate="header">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-history"></i>
                <span>Movimientos</span>
              </div>
            </ng-template>

            <p-table [value]="stockMovements" [loading]="loadingMovements" [paginator]="true" [rows]="10">
              <ng-template pTemplate="header">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-movement>
                <tr>
                  <td>{{ movement.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ movement.product_name }}</td>
                  <td>
                    <p-tag [value]="getMovementTypeLabel(movement.movement_type)"
                           [severity]="getMovementTypeSeverity(movement.movement_type)"></p-tag>
                  </td>
                  <td [class]="getQuantityClass(movement.movement_type)">
                    {{ movement.movement_type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                  </td>
                  <td>{{ movement.reason || 'Sin motivo' }}</td>
                  <td>{{ movement.user_name || 'Sistema' }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>

    <!-- Product Dialog -->
    <p-dialog [(visible)]="productDialog" [modal]="true" [style]="{width: '600px'}"
              [header]="(isEdit ? 'Editar' : 'Nuevo') + ' Producto'" [closable]="true" styleClass="p-fluid">
      <div class="formgrid grid">
        <div class="field col-12 md:col-8">
          <label for="name">Nombre *</label>
          <input pInputText [(ngModel)]="product.name" placeholder="Nombre del producto" class="w-full" required>
        </div>
        <div class="field col-12 md:col-4">
          <label for="barcode">Código de Barras</label>
          <input pInputText [(ngModel)]="product.barcode" placeholder="Código" class="w-full">
        </div>
        <div class="field col-12">
          <label for="description">Descripción</label>
          <textarea pInputTextarea [(ngModel)]="product.description" rows="3" class="w-full"></textarea>
        </div>
        <div class="field col-12 md:col-6">
          <label for="category">Categoría</label>
          <p-dropdown [options]="categories" [(ngModel)]="product.category" 
                    placeholder="Seleccionar categoría" [editable]="true" class="w-full"></p-dropdown>
        </div>
        <div class="field col-12 md:col-6">
          <label for="price">Precio de Venta *</label>
          <p-inputNumber [(ngModel)]="product.price" mode="currency" currency="USD" 
                         [min]="0" class="w-full" required></p-inputNumber>
        </div>
        <div class="field col-12 md:col-4">
          <label for="cost">Costo</label>
          <p-inputNumber [(ngModel)]="product.cost" mode="currency" currency="USD" 
                         [min]="0" class="w-full"></p-inputNumber>
        </div>
        <div class="field col-12 md:col-4">
          <label for="stock">Stock Inicial *</label>
          <p-inputNumber [(ngModel)]="product.stock" [min]="0" class="w-full" required></p-inputNumber>
        </div>
        <div class="field col-12 md:col-4">
          <label for="min_stock">Stock Mínimo *</label>
          <p-inputNumber [(ngModel)]="product.min_stock" [min]="0" class="w-full" required></p-inputNumber>
        </div>
        <div class="field col-12">
          <div class="flex align-items-center">
            <input type="checkbox" [(ngModel)]="product.is_active" id="is_active">
            <label for="is_active" class="ml-2">Producto activo</label>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" (click)="hideDialog()" styleClass="p-button-text"></p-button>
          <p-button label="Guardar" icon="pi pi-check" (click)="saveProduct()" [loading]="saving"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Stock Movement Dialog -->
    <p-dialog [(visible)]="stockDialog" [modal]="true" [style]="{width: '500px'}"
              header="Movimiento de Stock" [closable]="true" styleClass="p-fluid">
      <div class="formgrid grid">
        <div class="field col-12">
          <label for="product">Producto *</label>
          <p-dropdown [options]="products" [(ngModel)]="stockMovement.product"
                    optionLabel="name" optionValue="id" placeholder="Seleccionar producto"
                    [filter]="true" class="w-full" required></p-dropdown>
        </div>
        <div class="field col-12">
          <label for="movement_type">Tipo de Movimiento *</label>
          <p-dropdown [options]="movementTypes" [(ngModel)]="stockMovement.movement_type"
                    optionLabel="label" optionValue="value" class="w-full" required></p-dropdown>
        </div>
        <div class="field col-12">
          <label for="quantity">Cantidad *</label>
          <p-inputNumber [(ngModel)]="stockMovement.quantity" [min]="1" class="w-full" required></p-inputNumber>
        </div>
        <div class="field col-12">
          <label for="reason">Motivo</label>
          <textarea pInputTextarea [(ngModel)]="stockMovement.reason" rows="3" 
                    placeholder="Motivo del movimiento..." class="w-full"></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button label="Cancelar" icon="pi pi-times" (click)="stockDialog = false" styleClass="p-button-text"></p-button>
          <p-button label="Procesar" icon="pi pi-check" (click)="saveStockMovement()" [loading]="savingMovement"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  stockMovements: StockMovement[] = [];
  product: Partial<Product> = {};
  stockMovement: Partial<StockMovement> = {};
  categories: string[] = [];

  productDialog = false;
  stockDialog = false;
  isEdit = false;
  loading = false;
  loadingMovements = false;
  saving = false;
  savingMovement = false;

  searchTerm = '';
  selectedCategory = '';
  categoryOptions: any[] = [];

  // Stats
  lowStockCount = 0;
  totalProducts = 0;
  inventoryValue = 0;

  movementTypes = [
    { label: 'Entrada', value: 'in' },
    { label: 'Salida', value: 'out' },
    { label: 'Ajuste', value: 'adjustment' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadStockMovements();
    this.loadCategories();
    this.loadStats();
  }

  loadProducts() {
    this.loading = true;
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategory) params.category = this.selectedCategory;

    this.inventoryService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.results || response;
        this.totalProducts = this.products.length;
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.showError('Error al cargar productos');
        this.loading = false;
      }
    });
  }

  loadStockMovements() {
    this.loadingMovements = true;
    this.inventoryService.getStockMovements().subscribe({
      next: (response) => {
        this.stockMovements = response.results || response;
        this.loadingMovements = false;
      },
      error: () => {
        this.showError('Error al cargar movimientos');
        this.loadingMovements = false;
      }
    });
  }

  loadCategories() {
    this.inventoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoryOptions = categories.map(cat => ({ label: cat, value: cat }));
      },
      error: () => console.error('Error loading categories')
    });
  }

  loadStats() {
    this.inventoryService.getLowStockProducts().subscribe({
      next: (lowStockProducts) => {
        this.lowStockCount = lowStockProducts.length;
      },
      error: () => console.error('Error loading low stock products')
    });
  }

  calculateStats() {
    this.lowStockCount = this.products.filter(p => p.stock <= p.min_stock).length;
    this.inventoryValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  openNew() {
    this.product = {
      name: '',
      price: 0,
      stock: 0,
      min_stock: 5,
      is_active: true
    };
    this.isEdit = false;
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.isEdit = true;
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.product = {};
  }

  saveProduct() {
    if (!this.product.name || !this.product.price) {
      this.showWarn('Complete los campos requeridos');
      return;
    }

    this.saving = true;
    const operation = this.isEdit && this.product.id
      ? this.inventoryService.updateProduct(this.product.id, this.product)
      : this.inventoryService.createProduct(this.product);

    operation.subscribe({
      next: () => {
        this.showSuccess(`Producto ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
        this.loadProducts();
        this.hideDialog();
        this.saving = false;
      },
      error: () => {
        this.showError('Error al guardar producto');
        this.saving = false;
      }
    });
  }

  confirmDelete(product: Product) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteProduct(product.id!)
    });
  }

  deleteProduct(id: number) {
    this.inventoryService.deleteProduct(id).subscribe({
      next: () => {
        this.showSuccess('Producto eliminado correctamente');
        this.loadProducts();
      },
      error: () => this.showError('Error al eliminar producto')
    });
  }

  showStockMovement() {
    this.stockMovement = { movement_type: 'in', quantity: 1 };
    this.stockDialog = true;
  }

  adjustStock(product: Product) {
    this.stockMovement = {
      product: product.id,
      movement_type: 'adjustment',
      quantity: 1
    };
    this.stockDialog = true;
  }

  saveStockMovement() {
    if (!this.stockMovement.product || !this.stockMovement.quantity) {
      this.showWarn('Complete los campos requeridos');
      return;
    }

    this.savingMovement = true;
    this.inventoryService.createStockMovement(this.stockMovement).subscribe({
      next: () => {
        this.showSuccess('Movimiento de stock procesado');
        this.loadProducts();
        this.loadStockMovements();
        this.stockDialog = false;
        this.savingMovement = false;
      },
      error: () => {
        this.showError('Error al procesar movimiento');
        this.savingMovement = false;
      }
    });
  }

  getStockClass(product: Product): string {
    if (product.stock <= 0) return 'text-red-600 font-bold';
    if (product.stock <= product.min_stock) return 'text-orange-600 font-semibold';
    return 'text-green-600 font-semibold';
  }

  getMovementTypeLabel(type: string): string {
    const labels = { in: 'Entrada', out: 'Salida', adjustment: 'Ajuste' };
    return labels[type as keyof typeof labels] || type;
  }

  getMovementTypeSeverity(type: string): string {
    const severities = { in: 'success', out: 'danger', adjustment: 'info' };
    return severities[type as keyof typeof severities] || 'info';
  }

  getQuantityClass(type: string): string {
    if (type === 'out') return 'text-red-600 font-semibold';
    if (type === 'in') return 'text-green-600 font-semibold';
    return 'text-blue-600 font-semibold';
  }

  private showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: message });
  }

  private showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  private showWarn(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: message });
  }
}