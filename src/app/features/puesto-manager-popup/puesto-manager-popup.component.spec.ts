import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuestoManagerPopupComponent } from './puesto-manager-popup.component';

describe('PuestoManagerPopupComponent', () => {
  let component: PuestoManagerPopupComponent;
  let fixture: ComponentFixture<PuestoManagerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuestoManagerPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuestoManagerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
