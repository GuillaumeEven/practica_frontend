import { Component } from '@angular/core';
import { Router } from '@angular/router';
import ConstRoutes from 'src/app/shared/contants/const-routes';
import { LoginService } from 'src/app/core/services/login.service';
import { CommonModule } from '@angular/common';
import { GeneroManagerPopupComponent } from '../genero-manager-popup/genero-manager-popup.component';
import { PuestoManagerPopupComponent } from '../puesto-manager-popup/puesto-manager-popup.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, GeneroManagerPopupComponent, PuestoManagerPopupComponent]
})
export class HeaderComponent {
  constructor(private router: Router, private loginService: LoginService) {}

  isGeneroManagerOpen = false;
  isPuestoManagerOpen = false;

  openGeneros(): void {
    this.isGeneroManagerOpen = true;
  }

  closeGeneros(): void {
    this.isGeneroManagerOpen = false;
  }

  openPuestos(): void {
    this.isPuestoManagerOpen = true;
  }

  closePuestos(): void {
    this.isPuestoManagerOpen = false;
  }

  onChildAlert(event: { type: 'error' | 'success', message: string }): void {
    // temporarily log; header could surface global alerts later
    console.log('[header] child alert', event);
  }

  logout(): void {
    this.loginService.logout();
  }
}