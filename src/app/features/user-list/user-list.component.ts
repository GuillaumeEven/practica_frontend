import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioVM, UsuarioRequest, toViewModel } from 'src/app/core/services/user.mapper.service';
import { UserService } from 'src/app/core/services/user.service';
import { FormsModule } from '@angular/forms';
import { UserFormPopupComponent } from '../user-form-popup/user-form-popup.component';
import { DeleteConfirmPopupComponent } from '../delete-confirm-popup/delete-confirm-popup.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    UserFormPopupComponent,
    DeleteConfirmPopupComponent,
    FormsModule
  ]
})
export class UserListComponent implements OnInit {

  formPopupMode: 'create' | 'update' | 'closed' = 'closed';
  deletePopupMode: 'closed' | 'launch' = 'closed';
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
    this.selectedUserId = result.data && result.data.length > 0 ? result.data[0].id ?? null : null;
    if (result.error) {
      alert('Error al obtener usuarios: ' + result.error.message);
    } else {
      this.users = (result.data ?? []).map(u => toViewModel(u));
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
      } else if (result.data) {
        this.users = result.data.map(u => toViewModel(u));
        this.selectedUserId = this.users.length > 0 ? this.users[0].id ?? null : null;
      }
    });

  }

  launchCreatePopup(): void {
    this.formPopupMode = 'create';
  }

  launchUpdPopup(userId: number | null): void {
    if (userId === null) return;
    this.selectedUserId = userId;
    this.formPopupMode = 'update';
  }

  closeFormPopup(): void {
    this.formPopupMode = 'closed';
  }

  async onFormSaved(user: UsuarioRequest): Promise<void> {
    const nick = localStorage.getItem('nickUsuario') ?? '';
    const pass = localStorage.getItem('contrasena') ?? '';
    const res = this.formPopupMode === 'create'
      ? await this.userService.crearUsuario(user, nick, pass)
      : await this.userService.actualizarUsuario(this.selectedUserId!, user, nick, pass);
    if (res.error) {
      alert('Error: ' + (res.error?.message ?? res.error));
      return;
    }
    await this.refreshUsers();
    this.formPopupMode = 'closed';
  }

  launchDeletePopup(userId: number | null): void {
    if (userId === null) return;
    this.selectedUserId = userId;
    this.deletePopupMode = 'launch';
  }

  onCerrarDeletePopUpOk(): void {
    this.deletePopupMode = 'closed';
  }

  onCerrarDeletePopUpCancel(): void {
    this.deletePopupMode = 'closed';
  }

  async onDeleteConfirmed(): Promise<void> {
    if (this.selectedUserId === null) return;
    const nick = localStorage.getItem('nickUsuario') ?? '';
    const pass = localStorage.getItem('contrasena') ?? '';
    const res = await this.userService.eliminarUsuario(this.selectedUserId, nick, pass);
    if (res.error) {
      alert('Error: ' + (res.error?.message ?? res.error));
      return;
    }
    await this.refreshUsers();
    this.deletePopupMode = 'closed';
  }
}
