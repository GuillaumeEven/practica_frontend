import {Genero} from "./genero.model";
import {PuestoDeTrabajo} from "./puestodetrabajo.model";
import {Direccion} from "./direccion.model";

export interface Usuario {
  id: number;
  nick_usuario: string;
  nombre: string;
  contrasena: string;
  fecha_hora_creacion: Date;
  genero: Genero;
  primer_apellido: string;
  segundo_apellido: string;
  fecha_nacimiento: Date;
  hora_desayuno: string;
  puesto_trabajo: PuestoDeTrabajo;
  admin: boolean;
  direcciones: Direccion[];
}

export const usuarioInicial = {
  id: null,
  nick_usuario: null,
  nombre: null,
  contrasena: null,
  fecha_hora_creacion: new Date(),
  genero: { id: null, nombre: null },
  primer_apellido: null,
  segundo_apellido: null,
  fecha_nacimiento: null,
  hora_desayuno: null,
  puesto_trabajo: { id: null, nombre: null },
  admin: false,
  direcciones: null
};
