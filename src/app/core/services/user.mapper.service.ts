import { Injectable } from '@angular/core';
import { Usuario } from '../models/user.model';
import { Genero } from '../models/genero.model';
import { PuestoDeTrabajo } from '../models/puestodetrabajo.model';
import { Direccion } from '../models/direccion.model';

/**
 * View model used by templates (strings, formatted fields and computed props).
 * Keep it permissive to ease binding in template-driven forms.
 */
export interface UsuarioVM {
  id?: number | null;
  nickUsuario?: string | null;
  nombre?: string | null;
  contrasena?: string | null;
  fechaHoraCreacion?: string | null; // "YYYY-MM-DD HH:mm"
  fechaNacimiento?: string | null;   // "YYYY-MM-DD"
  genero?: Genero | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  horaDesayuno?: string | null;      // original raw value (e.g. "08:00:00")
  horaDesayunoFormatted?: string | null; // "08:00"
  puestoTrabajo?: PuestoDeTrabajo | null;
  admin?: boolean | null;
  direcciones?: Direccion[] | null;

  // computed / helper fields for UI
  age?: number | null;
  genderIcon?: string | null;
  fechaHoraCreacionFormatted?: string | null;
  direccionPrincipal?: string | null;
  extraDirecciones?: number | null;
}

/* ---------- Helpers (pure, well-tested) ---------- */

const pad = (n: number) => n.toString().padStart(2, '0');

function toDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (!dt || isNaN((dt as Date).getTime())) return null;
  return dt as Date;
}

/** Format date-only YYYY-MM-DD */
function formatDateOnly(d?: string | Date | null): string {
  const dt = toDate(d);
  if (!dt) return '';
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** Format date+time YYYY-MM-DD HH:mm */
function formatDateTime(d?: string | Date | null): string {
  const dt = toDate(d);
  if (!dt) return '';
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

/** Calculate age in years from date (string or Date) */
export function calculateAge(dob?: string | Date | null): number | null {
  if (!dob) return null;
  const b = toDate(dob);
  if (!b) return null;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age >= 0 ? age : 0;
}

/** Determine icon path from gender name (robust, case-insensitive) */
export function genderIconFor(id?: number | null): string {
  if (id === 1) return 'assets/images/Male.JPG';
  if (id === 2) return 'assets/images/Female.JPG';
  return 'assets/images/Other.png';
}

/** Robust extraction of a displayable primary address */
export function extractDireccionPrincipal(direcciones?: any[] | null): string {
  if (!direcciones || !Array.isArray(direcciones) || direcciones.length === 0) return '';
  const pick = (d: any) => {
    const street = d?.nombre_calle ?? d?.nombreCalle ?? d?.calle ?? '';
    const number = d?.numero_calle ?? d?.numeroCalle ?? d?.numero ?? '';
    const parts: string[] = [];
    if (street) parts.push(street);
    if (number !== undefined && number !== null && number !== '') parts.push(String(number));
    return parts.join(', ');
  };
  for (const d of direcciones) {
    if (d && (d.direccion_principal === true || d.direccionPrincipal === true)) {
      const res = pick(d);
      if (res) return res;
    }
  }
  return pick(direcciones[0]) ?? '';
}

/* ---------- Mapping functions ---------- */

/**
 * Map domain `Usuario` -> view-model `UsuarioVM`.
 * Keeps computed/format fields for templates.
 */
export function toViewModel(u: Usuario): UsuarioVM {
  if (!u) return {};
  const fechaNacimiento = u.fecha_nacimiento ? formatDateOnly(u.fecha_nacimiento) : '';
  const fechaHoraCreacion = u.fecha_hora_creacion ? formatDateTime(u.fecha_hora_creacion) : '';
  return {
    id: u.id ?? null,
    nickUsuario: u.nick_usuario ?? null,
    nombre: u.nombre ?? null,
    contrasena: u.contrasena ?? null,
    fechaNacimiento,
    fechaHoraCreacion,
    genero: u.genero ?? null,
    primerApellido: u.primer_apellido ?? null,
    segundoApellido: u.segundo_apellido ?? null,
    horaDesayuno: u.hora_desayuno ?? null,
    horaDesayunoFormatted: u.hora_desayuno ? (u.hora_desayuno.slice ? u.hora_desayuno.slice(0, 5) : String(u.hora_desayuno)) : '',
    puestoTrabajo: u.puesto_trabajo ?? null,
    admin: u.admin ?? false,
    direcciones: u.direcciones ?? null,

    // computed
    age: calculateAge(u.fecha_nacimiento),
    genderIcon: genderIconFor(u.genero?.id),
    fechaHoraCreacionFormatted: fechaHoraCreacion,
    direccionPrincipal: extractDireccionPrincipal(u.direcciones),
    extraDirecciones: u.direcciones && u.direcciones.length > 1 ? u.direcciones.length - 1 : 0
  };

}

/**
 * Request DTO matching the API's POST /usuarios and PUT /usuarios/:id body.
 * Uses flat IDs (genero_id, puesto_trabajo_id) and es_admin instead of nested objects.
 */
export interface UsuarioRequest {
  nick_usuario?: string | null;
  contrasena?: string | null;
  genero_id?: number | null;
  nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  fecha_nacimiento?: string | null;
  hora_desayuno?: string | null;
  es_admin?: boolean | null;
  puesto_trabajo_id?: number | null;
  direcciones?: {
    id?: number | null;
    nombre_calle: string;
    numero_calle?: string | null;
    direccion_principal: boolean;
    usuario_id?: number | null;
  }[];
}

/**
 * Map view-model `UsuarioVM` -> API request body `UsuarioRequest`.
 */
export function toRequest(vm: UsuarioVM): UsuarioRequest {
  const dirs = (vm.direcciones ?? []) as any[];
  return {
    nick_usuario: vm.nickUsuario ?? null,
    contrasena: vm.contrasena ?? null,
    genero_id: vm.genero?.id ?? null,
    nombre: vm.nombre ?? null,
    primer_apellido: vm.primerApellido ?? null,
    segundo_apellido: vm.segundoApellido ?? null,
    fecha_nacimiento: vm.fechaNacimiento ?? null,
    hora_desayuno: vm.horaDesayunoFormatted ?? vm.horaDesayuno ?? null,
    es_admin: vm.admin ?? false,
    puesto_trabajo_id: vm.puestoTrabajo?.id ?? null,
    direcciones: dirs.map(d => ({
      id: d?.id ?? null,
      nombre_calle: d?.nombre_calle ?? '',
      numero_calle: d?.numero_calle ?? null,
      direccion_principal: d?.direccion_principal ?? false,
      usuario_id: vm.id ?? null
    }))
  };
}

/**
 * Map view-model `UsuarioVM` -> domain `Usuario`.
 * Build domain object explicitly (avoid leaking VM-only props).
 */
export function toDomain(vm: UsuarioVM): Usuario {
  const fechaN = vm.fechaNacimiento ? toDate(vm.fechaNacimiento) : null;
  const fechaCre = vm.fechaHoraCreacion ? toDate(vm.fechaHoraCreacion) : new Date();
  const puesto: PuestoDeTrabajo = vm.puestoTrabajo
    ? { id: vm.puestoTrabajo.id != null ? Number(vm.puestoTrabajo.id) : 0, nombre: vm.puestoTrabajo.nombre ?? '' }
    : { id: 0, nombre: '' };

  return {
    id: vm.id ?? null,
    nick_usuario: vm.nickUsuario ?? null,
    nombre: vm.nombre ?? null,
    contrasena: vm.contrasena ?? null,
    fecha_hora_creacion: fechaCre,
    genero: vm.genero ?? { id: null, nombre: null },
    primer_apellido: vm.primerApellido ?? null,
    segundo_apellido: vm.segundoApellido ?? null,
    fecha_nacimiento: fechaN,
    hora_desayuno: vm.horaDesayunoFormatted ?? vm.horaDesayuno ?? null,
    puesto_trabajo: puesto,
    admin: vm.admin ?? false,
    direcciones: vm.direcciones ?? null
  } as Usuario;
}


@Injectable({
  providedIn: 'root'
})
export class UserMapperService {
  constructor() {}

  toViewModel(u: Usuario): UsuarioVM {
    return toViewModel(u);
  }

  toDomain(vm: UsuarioVM): Usuario {
    return toDomain(vm);
  }

  // expose helpers if consumers prefer DI
  calculateAge(dob?: string | Date | null): number | null { return calculateAge(dob); }
  genderIconFor(id?: number | null): string { return genderIconFor(id); }
  extractDireccionPrincipal(dirs?: any[] | null): string { return extractDireccionPrincipal(dirs); }
}