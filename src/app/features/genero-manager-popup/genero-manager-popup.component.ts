import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Genero } from '../../core/models/genero.model';
import { UserService } from 'src/app/core/services/user.service';
import { CatalogService } from 'src/app/core/services/catalog.service';

@Component({
  selector: 'app-genero-manager-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './genero-manager-popup.component.html',
  styleUrls: ['../shared/form-controls.css']
})
export class GeneroManagerPopupComponent implements OnInit {
  @Input() items: Genero[] = [];
  @Output() saved = new EventEmitter<Genero[]>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() alert = new EventEmitter<{ type: 'error' | 'success', message: string }>();

  editIdx: number | null = null;
  editName = '';
  newName = '';
  loading = false;

  constructor(private userService: UserService, private catalog: CatalogService) {}

  private deepClone<T>(src: T): T {
    // use structuredClone when available for proper deep cloning
    // fallback to JSON for plain data objects
    // NOTE: JSON loses functions/dates but our models are plain data
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof structuredClone === 'function') return structuredClone(src);
    return JSON.parse(JSON.stringify(src));
  }

  async ngOnInit(): Promise<void> {
    // load from service if no items provided
    if (!this.items || this.items.length === 0) {
      const res = await this.userService.obtenerGeneros();
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
    const res = await this.userService.actualizarGenero(item.id, { nombre: this.editName });
    this.loading = false;
    if (!res.error) {
      this.items[this.editIdx].nombre = this.editName;
      this.editIdx = null;
      this.editName = '';
      this.alert.emit({ type: 'success', message: 'Género actualizado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error actualizando género' });
    }
  }

  cancelEdit(): void {
    this.editIdx = null;
    this.editName = '';
  }

  async deleteItem(idx: number): Promise<void> {
    const id = this.items[idx].id;
    this.loading = true;
    const res = await this.userService.eliminarGenero(id);
    this.loading = false;
    if (!res.error) {
      this.items.splice(idx, 1);
      this.catalog.setGeneros(this.deepClone(this.items));
      this.alert.emit({ type: 'success', message: 'Género eliminado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error eliminando género' });
    }
  }

  async createNew(): Promise<void> {
    if (!this.newName.trim()) return;
    this.loading = true;
    const res = await this.userService.crearGenero({ nombre: this.newName.trim() });
    this.loading = false;
    if (!res.error && res.data) {
      this.items.push(this.deepClone(res.data));
      this.catalog.setGeneros(this.deepClone(this.items));
      this.newName = '';
      this.alert.emit({ type: 'success', message: 'Género creado.' });
    } else {
      this.alert.emit({ type: 'error', message: res.error?.message ?? 'Error creando género' });
    }
  }

  onSaveAll(): void {
    this.saved.emit(this.deepClone(this.items));
    this.catalog.setGeneros(this.deepClone(this.items));
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
