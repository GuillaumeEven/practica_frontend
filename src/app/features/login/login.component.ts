import { Component } from '@angular/core';
import { Router } from '@angular/router';
import ConstRouter from "src/app/shared/contants/const-routes";
import { LoginService } from "../../core/services/login.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { guardarUsuarioLogado } from '../../core/services/utils.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class LoginComponent {

  LoginService = LoginService;
  nickUsuario: string = '';
  password: string = '';
  loginError: string = '';

  constructor(private router: Router, private loginService: LoginService) {
    this.loginService = loginService;
  }

  async login() {
    this.loginError = '';
    const result = await this.loginService.iniciarSesion(this.nickUsuario, this.password);
    if (result.error) {
      this.loginError = result.error.message;
      return;
    }
    guardarUsuarioLogado({ ...(result.data ?? {}), nick_usuario: this.nickUsuario, contrasena: this.password } as any);
    this.router.navigate([ConstRouter.PATH_USUARIOS]);
  }

}
