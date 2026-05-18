import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import ConstUrls from "src/app/shared/contants/const-urls";
import { Usuario } from '../models/user.model';
import { firstValueFrom } from 'rxjs';
import { extractApiErrorMessage } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  apiUrl = ConstUrls.API_URL;

  constructor(private http: HttpClient) { }

  async iniciarSesion(username: string, password: string): Promise<{ error:any|null, data?: Usuario }> {
    try {
      const data = await firstValueFrom(this.http.post<Usuario>(`${this.apiUrl}/usuarios/iniciar-sesion`, { nick_usuario: username, contrasena: password }));
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }
}
