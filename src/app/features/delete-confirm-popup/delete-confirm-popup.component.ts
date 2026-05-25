import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioVM } from 'src/app/core/services/user.mapper.service';

@Component({
  selector: 'app-delete-confirm-popup',
  templateUrl: './delete-confirm-popup.component.html',
  styleUrls: ['./delete-confirm-popup.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DeleteConfirmPopupComponent {
  @Input() mode: 'closed' | 'launch' = 'closed';
  @Input() user?: UsuarioVM;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}