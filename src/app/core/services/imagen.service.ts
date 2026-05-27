import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import ConstUrls from 'src/app/shared/contants/const-urls';
import { extractApiErrorMessage } from './utils.service';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  apiUrl = ConstUrls.API_URL;

  constructor(private http: HttpClient) {}

  async crearImagen(imagenBase64: string, usuarioId?: number): Promise<{ error: any, data?: any }> {
    try {
      const payload: any = { imagen: imagenBase64 };
      if (usuarioId != null) payload.usuario_id = usuarioId;
      const created = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/imagenes`, payload));
      return { error: null, data: created };
    } catch (err: any) {
      // error handled and normalized below
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async obtenerImagen(id: number): Promise<{ error:any, data?: any }> {
    try {
      const data = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/imagenes/${id}`));
      return { error: null, data };
    } catch (err: any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }

  async eliminarImagen(id: number): Promise<{ error:any }> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/imagenes/${id}`));
      return { error: null };
    } catch (err: any) {
      return { error: { raw: err, message: extractApiErrorMessage(err) } };
    }
  }
}
