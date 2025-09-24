import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetAdminComponent } from './widget-admin.component';

describe('WidgetAdminComponent', () => {
  let component: WidgetAdminComponent;
  let fixture: ComponentFixture<WidgetAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [WidgetAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
