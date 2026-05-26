import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Genero } from '../models/genero.model';
import { PuestoDeTrabajo } from '../models/puestodetrabajo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private generosSubject = new BehaviorSubject<Genero[]>([]);
  private puestosSubject = new BehaviorSubject<PuestoDeTrabajo[]>([]);

  generos$(): Observable<Genero[]> {
    return this.generosSubject.asObservable();
  }

  puestos$(): Observable<PuestoDeTrabajo[]> {
    return this.puestosSubject.asObservable();
  }

  setGeneros(items: Genero[]): void {
    this.generosSubject.next(items);
  }

  setPuestos(items: PuestoDeTrabajo[]): void {
    this.puestosSubject.next(items);
  }
}
