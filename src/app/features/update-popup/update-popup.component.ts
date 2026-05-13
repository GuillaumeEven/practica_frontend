import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Usuario } from "src/app/core/models/user.model";
import { UsuarioVM, toDomain } from 'src/app/core/services/user.mapper.service';


@Component({
    selector: 'update-user-popup',
    templateUrl: './update-popup.component.html',
    styleUrls: ['./update-popup.component.css'],
    standalone: true,
    imports: [ CommonModule, FormsModule ]
})
export class UpdatePopupComponent implements OnChanges {

  @Input() user?: UsuarioVM;

  @Output() cerrarUpdPopUpOk = new EventEmitter<Usuario>();
  @Output() cerrarUpdPopUpCancel = new EventEmitter<void>();

  model: Partial<UsuarioVM> = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      // shallow copy (VM uses strings for dates)
      this.model = { ...this.user };
      // ensure fechaNacimiento is a string "YYYY-MM-DD"
      if (this.model.fechaNacimiento) {
        const v: any = this.model.fechaNacimiento;
        if (typeof v === 'string') {
          // if ISO datetime present, take date part
          this.model.fechaNacimiento = v.includes('T') ? v.slice(0,10) : v;
        } else {
          const dt = new Date(v);
          this.model.fechaNacimiento = !isNaN(dt.getTime()) ? dt.toISOString().slice(0,10) : '';
        }
      }

      // ensure fechaHoraCreacion is string "YYYY-MM-DD HH:mm"
      if (this.model.fechaHoraCreacion) {
        const v: any = this.model.fechaHoraCreacion;
        const dt = new Date(v);
        if (!isNaN(dt.getTime())) {
          this.model.fechaHoraCreacion = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
        } else {
          this.model.fechaHoraCreacion = '';
        }
      }
    } else {
      this.model = {};
    }
  }

  onSave() {
    const domain = toDomain(this.model as UsuarioVM);
    this.cerrarUpdPopUpOk.emit(domain);
  }

  onCancel() {
    this.cerrarUpdPopUpCancel.emit();
  }
}

