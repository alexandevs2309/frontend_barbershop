import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsCenterComponent } from './subscriptions-center.component';

describe('SubscriptionsCenterComponent', () => {
  let component: SubscriptionsCenterComponent;
  let fixture: ComponentFixture<SubscriptionsCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionsCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionsCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
