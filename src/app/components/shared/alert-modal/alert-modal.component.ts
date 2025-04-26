import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ]
})
export class AlertModalComponent {
  constructor(
    @Inject(MatDialogRef) public dialogRef: MatDialogRef<AlertModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Auto-close with a delay if type is success
    if (this.data.type === 'success') {
      setTimeout(() => {
        this.close();
      }, 3000); // Auto close after 3 seconds for success messages
    }
  }

  close(): void {
    this.dialogRef.close(true);
  }
} 