import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {Router} from "@angular/router";
import { UserPopupComponent } from '../user-popup/user-popup.component';
import { Usuario } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [ CommonModule, UserPopupComponent ]
})
export class UserListComponent implements OnInit {
  @Output() cerrarPopUpOk = new EventEmitter<void>();
  @Output() cerrarPopUpCancel = new EventEmitter<void>();

  modoPopup: String = 'CLOSED';

  constructor(private router: Router, private userService: UserService) {

  }

  users: Usuario[] = [];

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

      this.users = result;
    });
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
