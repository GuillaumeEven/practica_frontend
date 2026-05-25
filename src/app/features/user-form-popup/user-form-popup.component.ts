import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioVM, UsuarioRequest, toRequest } from 'src/app/core/services/user.mapper.service';
import { UserService } from 'src/app/core/services/user.service';
import { PuestoDeTrabajo } from 'src/app/core/models/puestodetrabajo.model';
import { Genero } from 'src/app/core/models/genero.model';
import { Direccion } from 'src/app/core/models/direccion.model';

// Interfaz interna para las direcciones en el formulario (camelCase para el UI)
export interface DireccionRow {
  id?: number;
  nombreCalle: string;
  numeroCalle?: string;
  direccionPrincipal: boolean;
  isEditing: boolean;  // ¿está la fila en modo edición?
  isNew: boolean;      // fila añadida localmente, aún no enviada
}

@Component({
  selector: 'app-user-form-popup',
  templateUrl: './user-form-popup.component.html',
  styleUrls: ['./user-form-popup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserFormPopupComponent implements OnInit, OnChanges {

  constructor(private userService: UserService) {}

  generos: Genero[] = [];
  puestosDeTrabajo: PuestoDeTrabajo[] = [];
  addressRows: DireccionRow[] = [];
  selectedAddressIdx: number | null = null;


  /** 'create' para un nuevo usuario, 'update' para editar uno existente */
  @Input() mode: 'create' | 'update' = 'create';
  /** Solo se pasa en modo 'update' */
  @Input() user?: UsuarioVM;

  @Output() saved = new EventEmitter<UsuarioRequest>();
  @Output() cancelled = new EventEmitter<void>();

  // Modelo interno del formulario
  model: Partial<UsuarioVM> = {};

  get title(): string {
    return this.mode === 'create' ? 'Create User' : 'Update User';
  }

  get saveLabel(): string {
    return this.mode === 'create' ? 'Create' : 'Save';
  }

  async ngOnInit(): Promise<void> {
    await this.loadCombos();
  }

  private async loadCombos(): Promise<void> {
    const [generoResponse, puestoResponse] = await Promise.all([
      this.userService.obtenerGeneros(),
      this.userService.obtenerPuestosDeTrabajo()
    ]);
    this.generos = generoResponse.data ?? [];
    this.puestosDeTrabajo = puestoResponse.data ?? [];
  }

  // Helper para la comparación en ngModel con objetos
  compareById(a: any, b: any): boolean {
    return a && b ? a.id === b.id : a === b;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] || changes['mode']) {
      this.initModel();
    }
  }

  private initModel(): void {
    if (this.mode === 'update' && this.user) {
      this.model = { ...this.user };
      this.normalizeDates();
      // Cargar las direcciones existentes (convertir snake_case → camelCase para el UI)
      this.addressRows = (this.user.direcciones ?? []).map(d => ({
        id: d.id,
        nombreCalle: d.nombre_calle ?? '',
        numeroCalle: d.numero_calle ?? undefined,
        direccionPrincipal: d.direccion_principal ?? false,
        isEditing: false,
        isNew: false
      }));
      // Seleccionar la primera por defecto
      if (this.addressRows.length > 0) this.selectedAddressIdx = 0;
    } else {
      // Creación: objeto vacío con tipos compatibles con UsuarioVM
      this.model = {
        id: null,
        nickUsuario: null,
        nombre: null,
        contrasena: null,
        fechaHoraCreacion: new Date().toISOString().slice(0, 16).replace('T', ' '),
        genero: null,
        primerApellido: null,
        segundoApellido: null,
        fechaNacimiento: null,
        horaDesayuno: null,
        puestoTrabajo: null,
        admin: false,
        direcciones: []
      };
      this.addressRows = [];
      this.selectedAddressIdx = null;
    }
  }

  private normalizeDates(): void {
    // fechaNacimiento → 'YYYY-MM-DD'
    if (this.model.fechaNacimiento) {
      const v: any = this.model.fechaNacimiento;
      this.model.fechaNacimiento = typeof v === 'string'
        ? (v.includes('T') ? v.slice(0, 10) : v)
        : new Date(v).toISOString().slice(0, 10);
    }
    // fechaHoraCreacion → 'YYYY-MM-DD HH:mm' (solo lectura)
    if (this.model.fechaHoraCreacion) {
      const dt = new Date(this.model.fechaHoraCreacion as any);
      if (!isNaN(dt.getTime())) {
        this.model.fechaHoraCreacion =
          `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} ` +
          `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      }
    }
  }

  onAddAddress(): void {
    const newRow: DireccionRow = {
      id: undefined,
      nombreCalle: '',
      numeroCalle: undefined,
      direccionPrincipal: this.addressRows.length === 0, // primera = principal por defecto
      isEditing: true,
      isNew: true
    };
    this.addressRows.push(newRow);
    this.selectedAddressIdx = this.addressRows.length - 1;
  }

  onEditAddress(): void {
    if (this.selectedAddressIdx === null) return;
    this.addressRows[this.selectedAddressIdx].isEditing = true;
  }

  onDeleteAddress(): void {
    if (this.selectedAddressIdx === null) return;
    this.addressRows.splice(this.selectedAddressIdx, 1);
    // Si la eliminada era la principal, establecemos la primera como principal
    if (this.addressRows.length > 0 && !this.addressRows.some(r => r.direccionPrincipal)) {
      this.addressRows[0].direccionPrincipal = true;
    }
    this.selectedAddressIdx = this.addressRows.length > 0 ? 0 : null;
  }

  onSetMain(idx: number): void {
    this.addressRows.forEach((row, i) => {
      row.direccionPrincipal = (i === idx);
    });
  }

  onSave(): void {
    // Merge address rows (camelCase UI) into the VM before building the request
    const vm: UsuarioVM = {
      ...this.model,
      direcciones: this.addressRows.map(row => ({
        id: row.id ?? null,
        nombre_calle: row.nombreCalle,
        numero_calle: row.numeroCalle,
        direccion_principal: row.direccionPrincipal
      } as any))
    };
    this.saved.emit(toRequest(vm));
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}