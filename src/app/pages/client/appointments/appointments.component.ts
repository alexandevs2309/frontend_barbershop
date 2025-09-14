import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentsService, Appointment } from './appointments.service';
import { ClientsService } from '../clients/clients.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';
import { HttpClient } from '@angular/common/http';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: 'app-appointments',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, CalendarModule, SelectModule, ToastModule,DatePicker, ConfirmDialogModule, TagModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
                <h2 class="m-0">Gestión de Citas</h2>
                <p-button label="Nueva Cita" icon="pi pi-plus" (click)="openNew()"></p-button>
            </div>

            <div class="flex gap-3 mb-4">
                <p-datepicker [(ngModel)]="selectedDate" (onSelect)="loadAppointments()" placeholder="Filtrar por fecha" [showIcon]="true" dateFormat="yy-mm-dd"></p-datepicker>

                <p-select [options]="statusOptions" [(ngModel)]="selectedStatus" (onChange)="loadAppointments()" placeholder="Todos los estados" [showClear]="true"></p-select>
            </div>

            <p-table [value]="appointments" [loading]="loading" [paginator]="true" [rows]="10" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Estilista</th>
                        <th>Fecha y Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-appointment>
                    <tr>
                        <td>{{ appointment.client_name || 'Cliente #' + appointment.client }}</td>
                        <td>{{ appointment.service_name || 'Servicio #' + appointment.service }}</td>
                        <td>{{ appointment.stylist_name || 'Estilista #' + appointment.stylist }}</td>
                        <td>{{ appointment.date_time | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                            <p-tag [value]="getStatusLabel(appointment.status)" [severity]="getStatusSeverity(appointment.status)"></p-tag>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" (click)="editAppointment(appointment)" pTooltip="Editar" styleClass="p-button-rounded p-button-text"></p-button>
                                <p-button icon="pi pi-check" (click)="completeAppointment(appointment)" *ngIf="appointment.status === 'scheduled'" pTooltip="Completar" styleClass="p-button-rounded p-button-success p-button-text"></p-button>
                                <p-button icon="pi pi-times" (click)="confirmCancel(appointment)" *ngIf="appointment.status === 'scheduled'" pTooltip="Cancelar" styleClass="p-button-rounded p-button-warning p-button-text"></p-button>
                                <p-button icon="pi pi-trash" (click)="confirmDelete(appointment)" pTooltip="Eliminar" styleClass="p-button-rounded p-button-danger p-button-text"></p-button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center">No hay citas registradas</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog Crear/Editar -->
        <p-dialog [(visible)]="appointmentDialog" [modal]="true" [style]="{ width: '500px' }" [header]="(isEdit ? 'Editar' : 'Nueva') + ' Cita'" [closable]="true" styleClass="p-fluid">
            <div class="formgrid grid">
                <div class="field col-12">
                    <label for="client">Cliente *</label>
                    <p-select [options]="clients" [(ngModel)]="appointment.client" optionLabel="full_name" optionValue="id" placeholder="Seleccionar cliente" class="w-full" required></p-select>
                </div>

                <div class="field col-12">
                    <label for="service">Servicio *</label>
                    <p-select [options]="services" [(ngModel)]="appointment.service" optionLabel="name" optionValue="id" placeholder="Seleccionar servicio" class="w-full" required></p-select>
                </div>

                <div class="field col-12">
                    <label for="stylist">Estilista *</label>
                    <p-select [options]="stylists" [(ngModel)]="appointment.stylist" optionLabel="display_name" optionValue="id" placeholder="Seleccionar estilista" class="w-full" required></p-select>
                </div>

                <div class="field col-12 md:col-6">
                    <label for="date">Fecha *</label>
                    <p-datepicker [(ngModel)]="appointmentDate" [showIcon]="true" dateFormat="yy-mm-dd" placeholder="Seleccionar fecha" class="w-full" required></p-datepicker>
                </div>

                <div class="field col-12 md:col-6">
                    <label for="time">Hora *</label>
                    <p-select [options]="timeSlots" [(ngModel)]="appointmentTime" placeholder="Seleccionar hora" class="w-full" required></p-select>
                </div>

                <div class="field col-12">
                    <label for="description">Notas</label>
                    <textarea pInputTextarea [(ngModel)]="appointment.description" rows="3" placeholder="Notas adicionales..." class="w-full"></textarea>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end gap-2">
                    <p-button label="Cancelar" icon="pi pi-times" (click)="hideDialog()" styleClass="p-button-text"></p-button>
                    <p-button label="Guardar" icon="pi pi-check" (click)="saveAppointment()" [loading]="saving"></p-button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
    `
})
export class AppointmentsComponent implements OnInit {
    appointments: Appointment[] = [];
    appointment: Partial<Appointment> = {};
    clients: any[] = [];
    services: any[] = [];
    stylists: any[] = [];
    timeSlots: any[] = [];

    appointmentDialog = false;
    isEdit = false;
    loading = false;
    saving = false;

    selectedDate: Date | null = null;
    selectedStatus = '';
    appointmentDate: Date | null = null;
    appointmentTime = '';

    statusOptions = [
        { label: 'Programadas', value: 'scheduled' },
        { label: 'Completadas', value: 'completed' },
        { label: 'Canceladas', value: 'cancelled' }
    ];

    constructor(
        private appointmentsService: AppointmentsService,
        private clientsService: ClientsService,
        private employeesService: EmployeesService,
        private servicesService: ServicesService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        this.loadAppointments();
        this.loadClients();
        this.loadServices();
        this.loadStylists();
        this.generateTimeSlots();
    }

    loadAppointments() {
        this.loading = true;
        const params: any = {};
        if (this.selectedDate) {
            params.date = this.selectedDate.toISOString().split('T')[0];
        }
        if (this.selectedStatus) params.status = this.selectedStatus;

        this.appointmentsService.getAppointments(params).subscribe({
            next: (response) => {
                this.appointments = response.results || response;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar citas'
                });
                this.loading = false;
            }
        });
    }

    loadClients() {
        this.clientsService.getClients().subscribe({
            next: (response) => (this.clients = response.results || response),
            error: () => console.error('Error loading clients')
        });
    }

    loadServices() {
        this.servicesService.getServices().subscribe({
            next: (response) => (this.services = response.results || response),
            error: () => console.error('Error loading services')
        });
    }

    loadStylists() {
        this.employeesService.getEmployees().subscribe({
            next: (response: any) => {
                const employees = Array.isArray(response) ? response : response.results || [];
                // Map employees to include user_id for stylist field and display name
                this.stylists = employees.map((emp: any) => ({
                    ...emp,
                    user_id: emp.user_id_read || emp.user?.id || emp.user_id, // Use user_id_read from backend
                    display_name: emp.user || `Employee #${emp.id}` // Display name
                }));
                console.log('Stylists data:', this.stylists);
            },
            error: () => console.error('Error loading stylists')
        });
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({ label: time, value: time });
            }
        }
        this.timeSlots = slots;
    }

    confirmCancel(appointment: Appointment) {
        this.confirmationService.confirm({
            message: `¿Está seguro de cancelar la cita con ${appointment.client_name || 'este cliente'}?`,
            header: 'Confirmar Cancelación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.cancelAppointment(appointment)
        });
        }


    openNew() {
        this.appointment = { status: 'scheduled' };
        this.appointmentDate = null;
        this.appointmentTime = '';
        this.isEdit = false;
        this.appointmentDialog = true;
    }

    editAppointment(appointment: Appointment) {
        this.appointment = { ...appointment };
        this.appointmentDate = new Date(appointment.date_time);
        this.appointmentTime = new Date(appointment.date_time).toTimeString().slice(0, 5);
        this.isEdit = true;
        this.appointmentDialog = true;
    }

    hideDialog() {
        this.appointmentDialog = false;
        this.appointment = {};
    }

   saveAppointment() {
    console.log('Appointment data:', this.appointment);
    console.log('Stylist value:', this.appointment.stylist);

    // 🔹 Validaciones específicas
    if (!this.appointment.client) {
        this.showWarn('Debe seleccionar un cliente');
        return;
    }
    if (!this.appointment.service) {
        this.showWarn('Debe seleccionar un servicio');
        return;
    }
    if (!this.appointment.stylist) {
        this.showWarn('Debe seleccionar un estilista');
        return;
    }
    if (!(this.appointmentDate instanceof Date) || isNaN(this.appointmentDate.getTime())) {
        this.showWarn('Debe seleccionar una fecha válida');
        return;
    }
    if (!this.appointmentTime || this.appointmentTime.trim() === '') {
        this.showWarn('Debe seleccionar una hora');
        return;
    }

    // 🔹 Combinar fecha y hora
    const dateTime = new Date(this.appointmentDate);
    const [hours, minutes] = this.appointmentTime.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    // 🔹 Validar que no sea una fecha pasada
    if (dateTime < new Date()) {
        this.showWarn('No puede crear una cita en una fecha pasada');
        return;
    }

    this.appointment.date_time = dateTime.toISOString();

    // 🔹 Convert stylist Employee ID to User ID
    const selectedStylist = this.stylists.find(s => s.id === this.appointment.stylist);
    console.log('Selected stylist:', selectedStylist);
    console.log('Original stylist ID:', this.appointment.stylist);
    if (selectedStylist && selectedStylist.user_id) {
        this.appointment.stylist = selectedStylist.user_id;
        console.log('Converted to user ID:', this.appointment.stylist);
    } else {
        console.log('No user_id found for stylist');
    }

    // 🔹 Guardar en backend
    this.saving = true;

    if (this.isEdit && this.appointment.id) {
        // Editar cita existente
        this.appointmentsService.updateAppointment(this.appointment.id, this.appointment).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita actualizada correctamente'
                });
                this.loadAppointments();
                this.appointmentDialog = false;
                this.saving = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar cita'
                });
                this.saving = false;
            }
        });
    } else {
        // Crear nueva cita (usando endpoint de prueba)
        console.log('Final appointment data being sent:', this.appointment);
        this.http.post('http://localhost:8000/api/appointments/test/', this.appointment).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita creada correctamente'
                });
                this.loadAppointments();
                this.appointmentDialog = false;
                this.saving = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al crear cita'
                });
                this.saving = false;
            }
        });
    }
}

// 🔹 Helper para mensajes de advertencia
private showWarn(detail: string) {
    this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail
    });
}

    completeAppointment(appointment: Appointment) {
        this.appointmentsService.updateAppointment(appointment.id!, { status: 'completed' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita completada'
                });
                this.loadAppointments();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al completar cita'
                });
            }
        });
    }

    cancelAppointment(appointment: Appointment) {
        this.appointmentsService.updateAppointment(appointment.id!, { status: 'cancelled' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita cancelada'
                });
                this.loadAppointments();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cancelar cita'
                });
            }
        });
    }

    confirmDelete(appointment: Appointment) {
        this.confirmationService.confirm({
            message: '¿Está seguro de eliminar esta cita?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteAppointment(appointment.id!)
        });
    }

    deleteAppointment(id: number) {
        this.appointmentsService.deleteAppointment(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Cita eliminada correctamente'
                });
                this.loadAppointments();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar cita'
                });
            }
        });
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            scheduled: 'Programada',
            completed: 'Completada',
            cancelled: 'Cancelada'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): string {
        const severities: any = {
            scheduled: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        return severities[status] || 'info';
    }
}
