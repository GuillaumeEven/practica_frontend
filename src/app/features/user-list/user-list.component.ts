import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserPopupComponent } from '../user-popup/user-popup.component';
import { Usuario } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { FormsModule } from '@angular/forms';
import { UpdatePopupComponent } from '../update-popup/update-popup.component';
import { UsuarioVM, toViewModel } from 'src/app/core/services/user.mapper.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    UserPopupComponent,
    UpdatePopupComponent,
    FormsModule
  ]
})
export class UserListComponent implements OnInit {

  @Output() cerrarPopUpOk = new EventEmitter<void>();
  @Output() cerrarPopUpCancel = new EventEmitter<void>();

  @Output() cerrarCreatePopUpOk = new EventEmitter<void>();
  @Output() cerrarCreatePopUpCancel = new EventEmitter<void>();

  @Output() cerrarUpdPopUpOk = new EventEmitter<void>();
  @Output() cerrarUpdPopUpCancel = new EventEmitter<void>();

  @Output() cerrarDeletePopUpOk = new EventEmitter<void>();
  @Output() cerrarDeletePopUpCancel = new EventEmitter<void>();

  modoPopup: String = 'CLOSED';
  modoUpdPopup: String = 'CLOSED';
  modoCreatePopup: String = 'CLOSED';
  modoDeletePopup: String = 'CLOSED';
  users: UsuarioVM[] = [];
  selectedUserId: number | null = null;

  constructor(private router: Router, private userService: UserService) {
  }

  get selectedUser(): UsuarioVM | undefined {
    return this.users.find(u => u.id === this.selectedUserId);
  }

  private async refreshUsers() {
    const nick = localStorage.getItem('nickUsuario');
    const pass = localStorage.getItem('contrasena');
    if (!nick || !pass) return;
    const result = await this.userService.obtenerUsuarios(nick, pass);
    if (Array.isArray(result)) {
      this.users = (result as Usuario[]).map(u => toViewModel(u));
    } else {
      alert('Error al obtener usuarios: ' + (result.error?.message || 'Unknown error'));
    }
  }

  ngOnInit(): void {
    // Load users from service on component initialization
    const nick = localStorage.getItem('nickUsuario');
    const pass = localStorage.getItem('contrasena');

    // Guard: ensure both credentials are available
    if (!nick || !pass) {
      alert('Error: Missing credentials in storage');
      return;
    }

    this.userService.obtenerUsuarios(nick, pass).then((result) => {
      if (result.error) {
        alert('Error al obtener usuarios: ' + result.error.message);
        return;
      }
      // Map domain users -> view-models for display
      this.users = (result as Usuario[]).map(u => toViewModel(u));
    });

  }

  onCerrarCreatePopUpOk() {
    this.modoCreatePopup = 'CLOSED';
  }

  onCerrarCreatePopUpCancel() {
    this.modoCreatePopup = 'CLOSED';
  }

  launchCreatePopup() {
    this.modoCreatePopup = 'LAUNCH';
  }

  onCerrarUpdPopUpOk() {
    this.modoUpdPopup = 'CLOSED';
  }

  onCerrarUpdPopUpCancel() {
    this.modoUpdPopup = 'CLOSED';
  }

  launchUpdPopup(userId: number) {
    this.selectedUserId = userId;
    this.modoUpdPopup = 'LAUNCH';
  }

  onCerrarDeletePopUpOk() {
    this.modoDeletePopup = 'CLOSED';
  }

  onCerrarDeletePopUpCancel() {
    this.modoDeletePopup = 'CLOSED';
  }

  launchDeletePopup(userId: number) {
    this.selectedUserId = userId;
    this.modoDeletePopup = 'LAUNCH';
  }

  async onUpdSave(updated?: Usuario) {
    if (!updated || typeof updated.id !== 'number') { this.modoUpdPopup = 'CLOSED'; return; }
    const nick = localStorage.getItem('nickUsuario');
    const pass = localStorage.getItem('contrasena');
    if (!nick || !pass) {
      alert('Error: Ningún credencial disponible en almacenamiento');
      this.modoUpdPopup = 'CLOSED';
      return;
    }
    const res = await this.userService.actualizarUsuario(updated, nick, pass);
    if (res.error) {
      console.log(res.error.error.message);
      alert('Error al actualizar: ' + (res.error.error.message ?? res.error));
      this.modoUpdPopup = 'CLOSED';
      return;
    }
    await this.refreshUsers(); // recarga el estado del servidor
    this.modoUpdPopup = 'CLOSED';
  }

  onCerrarPopUpOk() {
    this.modoPopup = 'CLOSED';
  }

  onCerrarPopUpCancel() {
    this.modoPopup = 'CLOSED';
  }

  launchPopup() {
    this.modoPopup = 'LAUNCH';
  }

  // @TODO: Implementar propiedades, atributos, métodos... necesarios para el funcionamiento del listado de usuarios

}
