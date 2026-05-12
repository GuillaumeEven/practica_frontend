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

  private genderIconFor(name?: string): string {
    if (!name) return 'assets/images/Other.png';
    const n = name.toLowerCase();
    if (n.includes('hom')) return 'assets/images/Male.JPG';
    if (n.includes('muj')) return 'assets/images/Female.JPG';
    return 'assets/images/Other.png';
  }

  private formatFechaHora(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}v ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private calculateAge(dob?: string | Date): number | null {
    if (!dob) return null;
    const b = typeof dob === 'string' ? new Date(dob) : dob;
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age >= 0 ? age : 0;
  }

  private extractDireccionPrincipal(direcciones: any[]): string {
    if (!direcciones || direcciones.length === 0) return '';
    for (const d of direcciones) {
      console.log('Direccion:', d.direccionPrincipal);
      if (d.direccionPrincipal) {
        return `${d.nombreCalle} ${d.numeroCalle}, ${d.ciudad}`;
      }
    }
    const d = direcciones[0];
    return `${d.nombreCalle} ${d.numeroCalle}, ${d.ciudad}`;
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
      this.users = result.map(u => ({
        ...u,
        genderIcon: this.genderIconFor(u.genero?.nombre),
        fechaHoraCreacionFormatted: this.formatFechaHora(u.fechaHoraCreacion),
        age: this.calculateAge(u.fechaNacimiento),
        horaDesayunoFormatted: u.horaDesayuno ? u.horaDesayuno.slice(0,5) : '',
        direccionPrincipal: this.extractDireccionPrincipal(u.direcciones),
        extraDirecciones: u.direcciones && u.direcciones.length > 1 ? u.direcciones.length - 1 : 0
      }));
      console.log(this.users);
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
