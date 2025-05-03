import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
  @Output() roleSelected = new EventEmitter<'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT'>();
  
  selectedRole: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT' | null = null;
  
  roleOptions: RoleOption[] = [
    {
      id: 'owner',
      title: 'Academy Owner',
      description: 'Create and manage your own academy with full administrative access',
      icon: 'fas fa-building',
      value: 'ACADEMY_OWNER'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Create courses, manage assignments, and track student progress',
      icon: 'fas fa-chalkboard-teacher',
      value: 'TEACHER'
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Join courses, submit assignments, and track your learning progress',
      icon: 'fas fa-user-graduate',
      value: 'STUDENT'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<RolePickerModalComponent>,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectRole(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    this.selectedRole = role;
  }

  confirmSelection() {
    if (this.selectedRole) {
      this.dialogRef.close(this.selectedRole);
      this.roleSelected.emit(this.selectedRole);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  // Static method to open this dialog
  static open(dialog: MatDialog): MatDialogRef<RolePickerModalComponent> {
    return dialog.open(RolePickerModalComponent, {
      width: '500px',
      panelClass: 'role-picker-dialog',
      disableClose: false
    });
  }
} 