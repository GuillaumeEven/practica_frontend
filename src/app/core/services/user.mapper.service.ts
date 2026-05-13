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
export function genderIconFor(name?: string | null): string {
  if (!name) return 'assets/images/Other.png';
  const n = name.toLowerCase();
  if (n.includes('hom')) return 'assets/images/Male.JPG';
  if (n.includes('muj')) return 'assets/images/Female.JPG';
  return 'assets/images/Other.png';
}

/** Robust extraction of a displayable primary address */
export function extractDireccionPrincipal(direcciones?: any[] | null): string {
  if (!direcciones || !Array.isArray(direcciones) || direcciones.length === 0) return '';
  const pick = (d: any) => {
    const street = d?.nombreCalle ?? d?.calle ?? '';
    const number = d?.numeroCalle ?? d?.numero ?? '';
    const city = d?.ciudad ?? d?.municipio ?? d?.localidad ?? '';
    const parts: string[] = [];
    if (street) parts.push(street);
    if (number !== undefined && number !== null && number !== '') parts.push(String(number));
    const addr = parts.join(' ');
    return city ? `${addr}, ${city}` : addr;
  };
  for (const d of direcciones) {
    if (d && (d.direccionPrincipal === true || d.direccionPrincipal === 'true')) {
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
  const fechaNacimiento = u.fechaNacimiento ? formatDateOnly(u.fechaNacimiento) : '';
  const fechaHoraCreacion = u.fechaHoraCreacion ? formatDateTime(u.fechaHoraCreacion) : '';
  return {
    id: u.id ?? null,
    nickUsuario: u.nickUsuario ?? null,
    nombre: u.nombre ?? null,
    contrasena: u.contrasena ?? null,
    fechaNacimiento,
    fechaHoraCreacion,
    genero: u.genero ?? null,
    primerApellido: u.primerApellido ?? null,
    segundoApellido: u.segundoApellido ?? null,
    horaDesayuno: u.horaDesayuno ?? null,
    horaDesayunoFormatted: u.horaDesayuno ? (u.horaDesayuno.slice ? u.horaDesayuno.slice(0, 5) : String(u.horaDesayuno)) : '',
    puestoTrabajo: u.puestoTrabajo ?? null,
    admin: u.admin ?? false,
    direcciones: u.direcciones ?? null,

    // computed
    age: calculateAge(u.fechaNacimiento),
    genderIcon: genderIconFor(u.genero?.nombre),
    fechaHoraCreacionFormatted: fechaHoraCreacion,
    direccionPrincipal: extractDireccionPrincipal(u.direcciones),
    extraDirecciones: u.direcciones && u.direcciones.length > 1 ? u.direcciones.length - 1 : 0
  };
}

/**
 * Map view-model `UsuarioVM` -> domain `Usuario`.
 * Build domain object explicitly (avoid leaking VM-only props).
 */
export function toDomain(vm: UsuarioVM): Usuario {
  // Defensive conversions
  const fechaN = vm.fechaNacimiento ? toDate(vm.fechaNacimiento) : null;
  const fechaCre = vm.fechaHoraCreacion ? toDate(vm.fechaHoraCreacion) : new Date();
  // Build puesto: ensure id is a number (use 0 as default if null)
  const puesto: PuestoDeTrabajo = vm.puestoTrabajo
    ? { id: vm.puestoTrabajo.id != null ? Number(vm.puestoTrabajo.id) : 0, nombre: vm.puestoTrabajo.nombre ?? '' }
    : { id: 0, nombre: '' };

  return {
    id: vm.id ?? null,
    nickUsuario: vm.nickUsuario ?? null,
    nombre: vm.nombre ?? null,
    contrasena: vm.contrasena ?? null,
    fechaHoraCreacion: fechaCre,
    genero: vm.genero ?? { id: null, nombre: null },
    primerApellido: vm.primerApellido ?? null,
    segundoApellido: vm.segundoApellido ?? null,
    fechaNacimiento: fechaN,
    horaDesayuno: vm.horaDesayunoFormatted ?? vm.horaDesayuno ?? null,
    puestoTrabajo: puesto,
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
  genderIconFor(name?: string | null): string { return genderIconFor(name); }
  extractDireccionPrincipal(dirs?: any[] | null): string { return extractDireccionPrincipal(dirs); }
}