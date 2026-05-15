import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Usuario } from '../models/user.model';
import { UsuarioRequest } from './user.mapper.service';
import to from "./utils.service";
import { firstValueFrom } from 'rxjs';
import ConstUrls from 'src/app/shared/contants/const-urls';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl = ConstUrls.API_URL;


  constructor(private http: HttpClient) {}

  async obtenerUsuarioPorId(id: number) {
    return await to(
        this.http
            .get<Usuario>('/assets/mocks/user.json')
            .toPromise()
    )
  }

  async obtenerUsuarios(username: string, password: string) {

    return await to(
        this.http
            .get<Usuario[]>(
              `${this.apiUrl}/usuarios`,
              { params: { nickUsuario: username, contrasena: password } })
            .toPromise()
    )
  }

  async actualizarUsuario(id: number, user: UsuarioRequest, username: string, password: string): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);

      const updated = await firstValueFrom(
        this.http.put<Usuario>(
          `${this.apiUrl}/usuarios/${id}`,
          user,
          { params }
        )
      );
      return { error: null, data: updated };
    } catch (error) {
      return { error, data: undefined };
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
    } catch (error) {
      return { error, data: undefined };
    }
  }

  async eliminarUsuario(id: number, username: string, password: string): Promise<{ error: any }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/usuarios/${id}`, { params })
      );
      return { error: null };
    } catch (error) {
      return { error };
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
    } catch (error) {
      return { error, data: [] };
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
    } catch (error) {
      return { error, data: [] };
    }
  }

}
