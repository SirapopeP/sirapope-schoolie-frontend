import { Component, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@app/services/auth.service';
import { ThemeService } from '../../../services/theme.service';

export interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT';
}

export interface RoleUpdateRequest {
  userId: string;
  oldRole: string;
  newRole: string;
}

export interface RolePickerDialogData {
  currentRole: string;
  userId: string;
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
    MatCardModule,
    HttpClientModule
  ]
})
export class RolePickerModalComponent implements OnInit {
  @Output() roleSelected = new EventEmitter<'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT'>();
  
  selectedRole: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT' | null = null;
  currentRole: string = 'GUEST';
  userId: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2
  
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
    @Inject(MAT_DIALOG_DATA) public data: RolePickerDialogData,
    private http: HttpClient,
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    if (data) {
      this.currentRole = data.currentRole || 'GUEST';
      this.userId = data.userId || '';
    }
  }
  
  ngOnInit() {
    // Set the primary color RGB CSS variable for use in the component
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
  }

  selectRole(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    this.selectedRole = role;
  }

  confirmSelection() {
    if (this.selectedRole) {
      this.isLoading = true;
      this.errorMessage = null;

      // Get token from auth service
      const token = this.authService.getToken();
      
      if (!token) {
        this.errorMessage = 'Authentication token is missing';
        this.isLoading = false;
        return;
      }

      // Prepare headers
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      // Prepare request body
      const requestBody: RoleUpdateRequest = {
        userId: this.userId,
        oldRole: this.currentRole,
        newRole: this.selectedRole
      };

      // Make API call
      this.http.put(`${environment.apiUrl}/roles/update`, requestBody, { headers })
        .pipe(
          tap(response => {
            console.log('Role updated successfully:', response);
            this.dialogRef.close(this.selectedRole);
            this.roleSelected.emit(this.selectedRole);
          }),
          catchError(error => {
            console.error('Error updating role:', error);
            this.errorMessage = error.message || 'Failed to update role. Please try again.';
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  // Static method to open this dialog
  static open(dialog: MatDialog, data: RolePickerDialogData): MatDialogRef<RolePickerModalComponent> {
    return dialog.open(RolePickerModalComponent, {
      width: '500px',
      panelClass: 'role-picker-dialog',
      disableClose: false,
      data
    });
  }
} 