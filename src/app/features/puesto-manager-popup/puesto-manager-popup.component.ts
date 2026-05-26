import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PuestoDeTrabajo } from '../../core/models/puestodetrabajo.model';
import { UserService } from 'src/app/core/services/user.service';
import { CatalogService } from 'src/app/core/services/catalog.service';

@Component({
  selector: 'app-puesto-manager-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './puesto-manager-popup.component.html',
  styleUrls: ['../shared/form-controls.css']
})
export class PuestoManagerPopupComponent implements OnInit {
  @Input() items: PuestoDeTrabajo[] = [];
  @Output() saved = new EventEmitter<PuestoDeTrabajo[]>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() alert = new EventEmitter<{ type: 'error' | 'success', message: string }>();

  editIdx: number | null = null;
  editName = '';
  newName = '';
  loading = false;

  constructor(private userService: UserService, private catalog: CatalogService) {}

  private deepClone<T>(src: T): T {
    if (typeof structuredClone === 'function') return structuredClone(src as any) as T;
    return JSON.parse(JSON.stringify(src));
  }

  async ngOnInit(): Promise<void> {
    if (!this.items || this.items.length === 0) {
      const res = await this.userService.obtenerPuestosDeTrabajo();
      this.items = (res.data ?? []).map(i => this.deepClone(i));
    } else {
      this.items = this.items.map(i => this.deepClone(i));
    }
  }

  startEdit(idx: number): void {
    this.editIdx = idx;
    this.editName = this.items[idx].nombre;
  }

  async saveEdit(): Promise<void> {
    if (this.editIdx === null) return;
    const item = this.items[this.editIdx];
    this.loading = true;
    const res = await this.userService.actualizarPuesto(item.id, { nombre: this.editName });
    this.loading = false;
    if (!res.error) {
      this.items[this.editIdx].nombre = this.editName;
      this.editIdx = null;
      this.editName = '';
      this.alert.emit({ type: 'success', message: 'Puesto actualizado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error actualizando puesto' });
    }
  }

  cancelEdit(): void {
    this.editIdx = null;
    this.editName = '';
  }

  async deleteItem(idx: number): Promise<void> {
    const id = this.items[idx].id;
    this.loading = true;
    const res = await this.userService.eliminarPuesto(id);
    this.loading = false;
    if (!res.error) {
      this.items.splice(idx, 1);
      this.catalog.setPuestos(this.deepClone(this.items));
      this.alert.emit({ type: 'success', message: 'Puesto eliminado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error eliminando puesto' });
    }
  }

  async createNew(): Promise<void> {
    if (!this.newName.trim()) return;
    this.loading = true;
    const res = await this.userService.crearPuesto({ nombre: this.newName.trim() });
    this.loading = false;
    if (!res.error && res.data) {
      this.items.push(this.deepClone(res.data));
      this.catalog.setPuestos(this.deepClone(this.items));
      this.newName = '';
      this.alert.emit({ type: 'success', message: 'Puesto creado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error creando puesto' });
    }
  }

  onSaveAll(): void {
    this.saved.emit(this.deepClone(this.items));
    this.catalog.setPuestos(this.deepClone(this.items));
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}