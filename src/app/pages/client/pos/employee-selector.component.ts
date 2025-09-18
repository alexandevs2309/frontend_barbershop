import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-employee-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  template: `
    <div class="employee-selector mb-2">
      <p-dropdown
        [options]="employees"
        [ngModel]="selectedEmployeeId"
        (ngModelChange)="onEmployeeChange($event)"
        optionLabel="full_name"
        optionValue="id"
        placeholder="Seleccionar empleado"
        [showClear]="true"
        styleClass="w-full text-sm">
      </p-dropdown>
    </div>
  `
})
export class EmployeeSelectorComponent {
  @Input() employees: any[] = [];
  @Input() selectedEmployeeId: number | null = null;
  @Output() employeeChange = new EventEmitter<number | null>();

  onEmployeeChange(employeeId: number | null) {
    this.employeeChange.emit(employeeId);
  }
}