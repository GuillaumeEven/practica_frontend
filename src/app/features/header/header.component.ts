import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import ConstRoutes from 'src/app/shared/contants/const-routes';
import { LoginService } from 'src/app/core/services/login.service';
import { CommonModule } from '@angular/common';
import { GeneroManagerPopupComponent } from '../genero-manager-popup/genero-manager-popup.component';
import { PuestoManagerPopupComponent } from '../puesto-manager-popup/puesto-manager-popup.component';
import { UserService } from 'src/app/core/services/user.service';
import { obtenerUsuarioLogado } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, GeneroManagerPopupComponent, PuestoManagerPopupComponent]
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router, private loginService: LoginService, private userService: UserService) {}

  private userUpdatedHandler = (_ev: Event) => {
    // reload display name + avatar when another component signals an update
    void this.loadUserAndAvatar();
  }

  isGeneroManagerOpen = false;
  isPuestoManagerOpen = false;
  avatarDataUrl: string | null = null;
  displayName: string | null = '';

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
    // header could surface global alerts later (no console logging)
  }

  logout(): void {
    this.loginService.logout();
  }

  async ngOnInit(): Promise<void> {
    window.addEventListener('usuarioActualizado', this.userUpdatedHandler);
    await this.loadUserAndAvatar();
  }

  ngOnDestroy(): void {
    window.removeEventListener('usuarioActualizado', this.userUpdatedHandler);
  }

  private async loadUserAndAvatar(): Promise<void> {
    try {
      const u = obtenerUsuarioLogado();
      if (!u) {
        this.displayName = '';
        this.avatarDataUrl = null;
        return;
      }
      // display name: prefer `nombre`, fallback to `nick_usuario`
      this.displayName = (u.nombre && u.nombre.trim()) ? u.nombre : (u.nick_usuario ?? '');

      // ask UserService to fetch image for logged user (it will call imagen API)
      const res = await this.userService.obtenerImagenUsuarioLogado();
      if (!res.error && res.data) {
        const img = res.data;
        this.avatarDataUrl = `data:${img.mime_type || 'image/png'};base64,${img.imagen}`;
      } else {
        this.avatarDataUrl = null;
      }
    } catch (e) {
      this.displayName = '';
      this.avatarDataUrl = null;
    }
  }
}