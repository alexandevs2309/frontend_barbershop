import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetAdminComponent } from './widget-admin.component';

describe('WidgetAdminComponent', () => {
  let component: WidgetAdminComponent;
  let fixture: ComponentFixture<WidgetAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
