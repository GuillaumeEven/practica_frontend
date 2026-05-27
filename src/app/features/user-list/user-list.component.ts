import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UsuarioVM, UsuarioRequest, toViewModel } from 'src/app/core/services/user.mapper.service';
import { UserService } from 'src/app/core/services/user.service';
import { CatalogService } from 'src/app/core/services/catalog.service';
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

  constructor(private router: Router, private userService: UserService, private catalog: CatalogService) {
  }

  private subs: Subscription[] = [];

  get selectedUser(): UsuarioVM | undefined {
    return this.users.find(u => u.id === this.selectedUserId);
  }

  private async refreshUsers(): Promise<void> {
    const result = await this.userService.obtenerUsuarios();
    if (result.error) {
      alert('Error al obtener usuarios: ' + result.error.message);
    } else {
      const prevSelected = this.selectedUserId;
      this.users = (result.data ?? []).map(u => toViewModel(u));
      if (prevSelected === null) {
        // initial load: select first user if any
        this.selectedUserId = this.users.length > 0 ? this.users[0].id ?? null : null;
      } else {
        // preserve selection when possible; otherwise fallback to first
        const stillExists = this.users.some(u => u.id === prevSelected);
        this.selectedUserId = stillExists ? prevSelected : (this.users.length > 0 ? this.users[0].id ?? null : null);
      }
    }
  }

  ngOnInit(): void {
    this.refreshUsers();
    // refresh users when generos or puestos change
    // so edits in managers are reflected immediately
    this.subs.push(this.catalog.generos$().subscribe(() => this.refreshUsers()));
    this.subs.push(this.catalog.puestos$().subscribe(() => this.refreshUsers()));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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
    const res = this.formPopupMode === 'create'
      ? await this.userService.crearUsuario(user)
      : await this.userService.actualizarUsuario(this.selectedUserId!, user);

    if (res.error) {
      alert('Error: ' + (res.error?.message ?? res.error));
      return;
    }
    // If the updated/created user is the logged user, broadcast event so header can refresh
    try {
      const loggedRaw = localStorage.getItem('usuarioLogado');
      const logged = loggedRaw ? JSON.parse(loggedRaw) : null;
      if (res.data && logged && res.data.id === logged.id) {
        window.dispatchEvent(new CustomEvent('usuarioActualizado', { detail: res.data }));
      }
    } catch (_) {
      // ignore
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
    const res = await this.userService.eliminarUsuario(this.selectedUserId);
    if (res.error) {
      alert('Error: ' + (res.error?.message ?? res.error));
      return;
    }
    await this.refreshUsers();
    this.deletePopupMode = 'closed';
  }
}
