import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Usuario } from '../models/user.model';
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

  async actualizarUsuario(user: Usuario, username: string, password: string): Promise<{ error: any, data?: Usuario }> {
    try {
      const params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, username)
        .set(ConstUrls.PASS_USUARIO_PARAM, password);

      const updated = await firstValueFrom(
        this.http.put<Usuario>(
          `${this.apiUrl}/usuarios/${user.id}`,
          user, // body
          { params } // options
        )
      );
      return { error: null, data: updated };
    } catch (error) {
      return { error, data: undefined };
    }
  }

}
