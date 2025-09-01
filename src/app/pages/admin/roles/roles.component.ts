import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RoleService, Role } from '../roles/roles.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Dialog } from "primeng/dialog";
import { Button } from "primeng/button";
import { TableModule } from "primeng/table";

@Component({
  selector: 'app-role',
  templateUrl: './roles.component.html',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Dialog, Button, TableModule]
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  form: FormGroup;
  isEditing = false;
  currentRoleId: number | null = null;
  showDialog = false;

  constructor(private roleService: RoleService, private fb: FormBuilder) {
    this.form = this.fb.group({ name: [''] });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe(data => this.roles = data);
  }

  startCreate(): void {
    this.isEditing = false;
    this.currentRoleId = null;
    this.form.reset();
    this.showDialog= true
  }

  startEdit(role: Role): void {
    this.isEditing = true;
    this.currentRoleId = role.id;
    this.form.patchValue(role);
  }

  save(): void {
    if (this.isEditing && this.currentRoleId !== null) {
      this.roleService.updateRole(this.currentRoleId, this.form.value)
        .subscribe(() => {
          this.loadRoles();
          this.cancel();
        });
    } else {
      this.roleService.createRole(this.form.value)
        .subscribe(() => {
          this.loadRoles();
          this.cancel();
        });
    }
  }

  delete(roleId: number): void {
    this.roleService.deleteRole(roleId)
      .subscribe(() => this.loadRoles());
  }

  cancel(): void {
    this.showDialog= false;
    this.isEditing = false;
    this.currentRoleId = null;
    this.form.reset();
  }
}
