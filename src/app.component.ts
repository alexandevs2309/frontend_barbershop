import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {  EntitlementsService } from './app/layout/service/entitlements.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
constructor(private ent: EntitlementsService) {}
ngOnInit() { this.ent.load().subscribe(); }

}
