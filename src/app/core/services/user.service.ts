import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/user.model';
import { UsuarioRequest } from './user.mapper.service';
import { firstValueFrom } from 'rxjs';
import ConstUrls from 'src/app/shared/contants/const-urls';
import { extractApiErrorMessage, loadCredentials, obtenerUsuarioLogado, guardarUsuarioLogado } from './utils.service';
import { ImagenService } from './imagen.service';
import { LoginService } from './login.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl = ConstUrls.API_URL;


  constructor(private http: HttpClient, private loginService: LoginService, private imagenService: ImagenService) {}

  /**
   * Fetch the image record for the currently logged user (if any).
   * Returns { error, data? } where data is the ImagenDTO from the API.
   */
  async obtenerImagenUsuarioLogado(): Promise<{ error:any, data?: any }> {
    try {
      let u = obtenerUsuarioLogado();
      if (!u) return { error: null, data: null };

      // If localStorage lacks imagen_id, try refreshing the user from the API
      if (!(u as any).imagen_id && u.id) {
        const fresh = await this.obtenerUsuarioPorId(u.id);
        if (!fresh.error && fresh.data) {
          u = fresh.data as any;
          // persist refreshed user so storage reflects server state
          try { guardarUsuarioLogado(u as any); } catch(_) {}
        }
      }

      if (!(u as any).imagen_id) return { error: null, data: null };
      const id = (u as any).imagen_id;
      const res = await this.imagenService.obtenerImagen(id);
      return res;
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerUsuarioPorId(id: number): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = loadCredentials();
      const data = await firstValueFrom(this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`, { params }));
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerUsuarios(): Promise<{ error: any, data?: Usuario[] }> {
    try {
      const params = loadCredentials();
      const data = await firstValueFrom(this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { params }));
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async actualizarUsuario(id: number, user: UsuarioRequest): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = loadCredentials();
      const updated = await firstValueFrom(
        this.http.put<Usuario>(
          `${this.apiUrl}/usuarios/${id}`,
          user,
          { params }
        )
      );
      // If the updated user is the currently logged user, persist the fresh data to localStorage
      try {
        const logged = obtenerUsuarioLogado();
        if (logged && logged.id === updated.id) {
          guardarUsuarioLogado(updated);
        }
      } catch (_) {
        // non-fatal
      }
      return { error: null, data: updated };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async crearUsuario(user: UsuarioRequest): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = loadCredentials();
      const created = await firstValueFrom(
        this.http.post<Usuario>(`${this.apiUrl}/usuarios`, user, { params })
      );
      return { error: null, data: created };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async eliminarUsuario(id: number): Promise<{ error: any }> {
    try {
      const params = loadCredentials();
      await firstValueFrom(this.http.delete(`${this.apiUrl}/usuarios/${id}`, { params }));
      const loggedUser = obtenerUsuarioLogado();
      if (loggedUser?.id === id) {
        this.loginService.logout();
      }
      return { error: null };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerGeneros(): Promise<{ error: any, data?: any[] }> {
    try {
      const params = loadCredentials();
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/generos`, { params })
      );
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: [] };
    }
  }

  async crearGenero(payload: { nombre: string }): Promise<{ error: any, data?: any }> {
    try {
      const params = loadCredentials();
      const created = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/generos`, payload, { params }));
      return { error: null, data: created };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async actualizarGenero(id: number, payload: { nombre: string }): Promise<{ error: any, data?: any }> {
    try {
      const params = loadCredentials();
      const updated = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/generos/${id}`, payload, { params }));
      return { error: null, data: updated };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async eliminarGenero(id: number): Promise<{ error: any }> {
    try {
      const params = loadCredentials();
      await firstValueFrom(this.http.delete(`${this.apiUrl}/generos/${id}`, { params }));
      return { error: null };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerPuestosDeTrabajo(): Promise<{ error: any, data?: any[] }> {
    try {
      const params = loadCredentials();
      const data = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/puestos`, { params })
      );
      return { error: null, data };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: [] };
    }
  }

  async crearPuesto(payload: { nombre: string }): Promise<{ error: any, data?: any }> {
    try {
      const params = loadCredentials();
      const created = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/puestos`, payload, { params }));
      return { error: null, data: created };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async actualizarPuesto(id: number, payload: { nombre: string }): Promise<{ error: any, data?: any }> {
    try {
      const params = loadCredentials();
      const updated = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/puestos/${id}`, payload, { params }));
      return { error: null, data: updated };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) }, data: undefined };
    }
  }

  async eliminarPuesto(id: number): Promise<{ error: any }> {
    try {
      const params = loadCredentials();
      await firstValueFrom(this.http.delete(`${this.apiUrl}/puestos/${id}`, { params }));
      return { error: null };
    } catch (err:any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

}
