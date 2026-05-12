import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import to from './utils.service';
import ConstUrls from "src/app/shared/contants/const-urls";
import { Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  apiUrl = ConstUrls.API_URL;

  constructor(private http: HttpClient) { }

  async iniciarSesion(username: string, password: string) {
    return await to(
      this.http.post<Usuario>(
        `${this.apiUrl}/usuarios/iniciar-sesion`,
        {'nickUsuario': username, 'contrasena': password }).toPromise()
    );
  }
}
