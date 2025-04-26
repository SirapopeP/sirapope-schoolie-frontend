import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT';
}

@Component({
  selector: 'app-role-picker-modal',
  templateUrl: './role-picker-modal.component.html',
  styleUrls: ['./role-picker-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class RolePickerModalComponent {
  selectedRole: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT' | null = null;
  
  roleOptions: RoleOption[] = [
    {
      id: 'owner',
      title: 'Academy Owner',
      description: 'Create and manage your own academy',
      icon: '🏫',
      value: 'ACADEMY_OWNER'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Teach and manage courses',
      icon: '👨‍🏫',
      value: 'TEACHER'
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Learn and join courses',
      icon: '🎓',
      value: 'STUDENT'
    }
  ];

  constructor(
    @Inject(MatDialogRef) public dialogRef: MatDialogRef<RolePickerModalComponent>
  ) {}

  selectRole(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    this.selectedRole = role;
  }

  confirmSelection() {
    if (this.selectedRole) {
      this.dialogRef.close(this.selectedRole);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 