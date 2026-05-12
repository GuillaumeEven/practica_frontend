import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Usuario } from '../models/user.model';
import to from "./utils.service";
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

}
