import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Usuario } from '../models/user.model';
import { UsuarioRequest } from './user.mapper.service';
import { firstValueFrom } from 'rxjs';
import ConstUrls from 'src/app/shared/contants/const-urls';
import { extractApiErrorMessage } from './utils.service';
import { LoginService } from './login.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl = ConstUrls.API_URL;


  constructor(private http: HttpClient, private loginService: LoginService) {}

  async obtenerUsuarioPorId(id: number) {
    try {
      const data = await firstValueFrom(this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`));
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerUsuarios(username: string, password: string) {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      const data = await firstValueFrom(this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { params }));
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async actualizarUsuario(id: number, user: UsuarioRequest, username: string, password: string): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      console.log('Updating user with ID:', id, 'Data:', user);
      const updated = await firstValueFrom(
        this.http.put<Usuario>(
          `${this.apiUrl}/usuarios/${id}`,
          user,
          { params }
        )
      );
      return { error: null, data: updated };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async crearUsuario(user: UsuarioRequest, username: string, password: string): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      const created = await firstValueFrom(
        this.http.post<Usuario>(`${this.apiUrl}/usuarios`, user, { params })
      );
      return { error: null, data: created };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async eliminarUsuario(id: number, username: string, password: string): Promise<{ error: any }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/usuarios/${id}`, { params })
      ).then(() => {
        if (username === localStorage.getItem('nickUsuario')) {
          this.loginService.logout();
        }
      });
      return { error: null };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerGeneros(username: string, password: string): Promise<{ error: any, data?: any[] }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/usuarios/obtener-generos`, { params })
      );
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: [] };
    }
  }

  async obtenerPuestosDeTrabajo(username: string, password: string): Promise<{ error: any, data?: any[] }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/usuarios/obtener-puestos`, { params })
      );
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: [] };
    }
  }

}
