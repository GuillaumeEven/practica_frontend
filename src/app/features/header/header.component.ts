import { Component } from '@angular/core';
import { Router } from '@angular/router';
import ConstRoutes from 'src/app/shared/contants/const-routes';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true
})
export class HeaderComponent {
  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('nickUsuario');
    localStorage.removeItem('contrasena');
    this.router.navigate([ConstRoutes.PATH_LOGIN]);
  }
}