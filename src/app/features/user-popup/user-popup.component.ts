import { Component, EventEmitter, OnInit, Output} from "@angular/core";
import { CommonModule } from "@angular/common";


@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.css'],
    standalone: true,
    imports: [ CommonModule ]
})
export class UserPopupComponent implements OnInit {

    @Output() cerrarPopUpOk = new EventEmitter<void>();
    @Output() cerrarPopUpCancel = new EventEmitter<void>();
    constructor() {

    }

    async ngOnInit() {
    }

    async onSave() {
        console.log('Boton Guardar pulsado');
        const username = localStorage.getItem('nickUsuario');
        const password = localStorage.getItem('contrasena');
    }

    onCancel() {
        this.cerrarPopUpCancel.emit();

    }
}
