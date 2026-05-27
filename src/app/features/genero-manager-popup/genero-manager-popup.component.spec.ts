import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneroManagerPopupComponent } from './genero-manager-popup.component';

describe('GeneroManagerPopupComponent', () => {
  let component: GeneroManagerPopupComponent;
  let fixture: ComponentFixture<GeneroManagerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneroManagerPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneroManagerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
