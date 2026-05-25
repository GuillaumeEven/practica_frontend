import {Genero} from "./genero.model";
import {PuestoDeTrabajo} from "./puestodetrabajo.model";
import {Direccion} from "./direccion.model";

export interface Usuario {
  id: number | null;
  nick_usuario: string | null;
  nombre: string | null;
  contrasena: string | null;
  fecha_hora_creacion: Date;
  genero: Genero | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  fecha_nacimiento: Date | null;
  hora_desayuno: string | null;
  puesto_trabajo: PuestoDeTrabajo | null;
  admin: boolean;
  direcciones: Direccion[] | null;
}

export const usuarioInicial: Usuario = {
  id: null,
  nick_usuario: null,
  nombre: null,
  contrasena: null,
  fecha_hora_creacion: new Date(),
  genero: null,
  primer_apellido: null,
  segundo_apellido: null,
  fecha_nacimiento: null,
  hora_desayuno: null,
  puesto_trabajo: null,
  admin: false,
  direcciones: null
};
