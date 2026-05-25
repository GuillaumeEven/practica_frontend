import {HttpHeaders, HttpParams} from "@angular/common/http";
import ConstUrls from "../../shared/contants/const-urls";
import ConstLocalStorage from "../../shared/contants/const-local-storage";
import {Usuario} from "../models/user.model";

export function extractApiErrorMessage(err: any): string {
    const body = err?.error;
    // Cas Spring Boot validation: { errors: [{ message }] }
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
        // Prend le champ 'message' ou 'defaultMessage' si présent
        return body.errors.map((e: any) => e?.message || e?.defaultMessage || JSON.stringify(e)).join(' | ');
    }
    // Cas custom: { exception: { mensajeDeError } }
    if (body?.exception?.mensajeDeError) return body.exception.mensajeDeError;
    // Cas standard: { message }
    if (body?.message) return body.message;
    return err?.message ?? 'Error desconocido';
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
    const usuario = obtenerUsuarioLogado();

    if (!usuario?.nick_usuario || !usuario?.contrasena) {
        return new HttpParams();
    }

    return new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, usuario.nick_usuario)
        .set(ConstUrls.PASS_USUARIO_PARAM, usuario.contrasena);
}

export function guardarUsuarioLogado(usuario: Usuario): void {
    localStorage.setItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE, JSON.stringify(usuario));
    // Keep individual keys so existing consumers can still read them directly.
    localStorage.setItem('nickUsuario', usuario.nick_usuario ?? '');
    localStorage.setItem('contrasena', usuario.contrasena ?? '');
}

export function obtenerUsuarioLogado(): Usuario | null {
    const raw = localStorage.getItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as Usuario;
    } catch {
        return null;
    }
}
