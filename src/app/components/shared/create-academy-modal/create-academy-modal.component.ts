import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface CreateAcademyData {
  name: string;
  bio?: string;
  logoUrl?: string;
}

@Component({
  selector: 'app-create-academy-modal',
  templateUrl: './create-academy-modal.component.html',
  styleUrls: ['./create-academy-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CreateAcademyModalComponent {
  academyData: CreateAcademyData = {
    name: '',
    bio: '',
    logoUrl: ''
  };

  constructor(
    @Inject(MatDialogRef) public dialogRef: MatDialogRef<CreateAcademyModalComponent>
  ) {}

  onSubmit() {
    if (this.academyData.name) {
      this.dialogRef.close(this.academyData);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 