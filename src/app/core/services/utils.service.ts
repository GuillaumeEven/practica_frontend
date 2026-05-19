import {HttpHeaders, HttpParams} from "@angular/common/http";
import ConstUrls from "../../shared/contants/const-urls";
import ConstLocalStorage from "../../shared/contants/const-local-storage";
import {Usuario} from "../models/user.model";

export function extractApiErrorMessage(err: any): string {
  return err?.error?.message ?? err?.message ?? 'Error desconocido';
}

export function isOkResponse(response: any): boolean {
    if (response && response.body && response.body.type === "OK") {
        return true
    }
    return false
}

export function loadResponseData(response: any): any {
    return response.body.data;
}

export function loadResponseError(response: any): string {
    if (!response || !response.body || !response.body.exception) {
        return "Error inesperado de servidor";
    } else {
        return response.body.exception.codigoDeError + ' ' + response.body.exception.mensajeDeError;
    }
}

export const headers = new HttpHeaders({
    'Content-Type': 'application/json'
});

export function loadCredentials(): HttpParams {
    return new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, obtenerUsuarioLogado().nick_usuario)
        .set(ConstUrls.PASS_USUARIO_PARAM, obtenerUsuarioLogado().contrasena);
}

export function guardarUsuarioLogado(usuario: Usuario) {
    localStorage.setItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE, JSON.stringify(usuario));
}

export function obtenerUsuarioLogado(): Usuario {
    return JSON.parse(localStorage.getItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE));
}
