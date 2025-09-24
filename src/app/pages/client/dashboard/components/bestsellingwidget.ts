import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: ` <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Best Selling Services</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        <ul class="list-none p-0 m-0">
            <li *ngFor="let service of topServices; let i = index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ service.name }}</span>
                    <div class="mt-1 text-muted-color">{{ service.count }} ventas</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div [class]="getBarColor(i)" class="h-full" [style.width.%]="service.percentage"></div>
                    </div>
                    <span [class]="getTextColor(i)" class="ml-4 font-medium">{{ service.percentage }}%</span>
                </div>
            </li>
        </ul>
    </div>`
})
export class BestSellingWidget implements OnInit {
    menu = null;
    topServices: any[] = [];
    
    colors = [
        { bar: 'bg-orange-500', text: 'text-orange-500' },
        { bar: 'bg-cyan-500', text: 'text-cyan-500' },
        { bar: 'bg-pink-500', text: 'text-pink-500' },
        { bar: 'bg-green-500', text: 'text-green-500' },
        { bar: 'bg-purple-500', text: 'text-purple-500' },
        { bar: 'bg-teal-500', text: 'text-teal-500' }
    ];

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadTopServices();
    }

    loadTopServices() {
        this.http.get(`${environment.apiUrl}/reports/?type=appointments`).subscribe({
            next: (data: any) => {
                const services = data.by_service || [];
                if (services.length === 0) {
                    this.topServices = [];
                    return;
                }
                
                const maxCount = Math.max(...services.map((s: any) => s.count));
                
                this.topServices = services.slice(0, 6).map((service: any) => ({
                    name: service.service__name || 'Servicio',
                    count: service.count,
                    percentage: Math.round((service.count / maxCount) * 100)
                }));
            },
            error: () => {
                this.topServices = [];
            }
        });
    }

    getBarColor(index: number): string {
        return this.colors[index % this.colors.length].bar;
    }

    getTextColor(index: number): string {
        return this.colors[index % this.colors.length].text;
    }
}
