import { Component, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { catchError, finalize, tap, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@app/services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { Router } from '@angular/router';
import { AlertService } from '@app/services/alert.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AcademiesService, CreateAcademyRequest } from '@app/services/academies.service';

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

export interface AcademyFormData {
  name: string;
  bio: string;
}

@Component({
  selector: 'app-role-picker-modal',
  templateUrl: './role-picker-modal.component.html',
  styleUrls: ['./role-picker-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
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
  
  // Academy form state
  isCreatingAcademy: boolean = false;
  academyFormData: AcademyFormData = {
    name: '',
    bio: ''
  };
  
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
    private themeService: ThemeService,
    private router: Router,
    private alertService: AlertService,
    private academiesService: AcademiesService
  ) {
    if (data) {
      this.currentRole = data.currentRole || 'GUEST';
      this.userId = data.userId || '';
    }
    
    // If userId is not provided in data, try to get it from auth service
    if (!this.userId) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        console.log('Retrieved user ID from auth service:', currentUser.id);
        this.userId = currentUser.id;
        
        // Also update role if available
        if (currentUser.roles && currentUser.roles.length > 0) {
          this.currentRole = currentUser.roles[0];
        }
      } else {
        console.warn('Could not retrieve user ID from auth service');
      }
    }
    
    // ตรวจสอบและลบ mock token ถ้ามี
    this.checkAndClearMockToken();
  }
  
  ngOnInit() {
    // Set the primary color RGB CSS variable for use in the component
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
    
    // Check authentication status on initialization
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    // Verify we have a token
    const token = this.authService.getToken();
    
    // แสดงข้อมูลเกี่ยวกับ token แบบไม่เปิดเผยตัว token ทั้งหมด
    console.log('Authentication status before request:', {
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      userId: this.userId || 'missing',
      tokenType: token ? (token.startsWith('Bearer ') ? 'Bearer token' : token.startsWith('mock_token_') ? 'Mock token (INVALID)' : 'Other token') : 'No token'
    });
    
    // เช็คว่ามี token หรือไม่ ถ้าไม่มีหรือเป็น mock token ให้ redirect ไปหน้า login
    if (!token || token.startsWith('mock_token_')) {
      console.error('Invalid or missing token detected');
      this.alertService.showAlert({
        type: 'error',
        message: 'Your session has expired. Please login again to continue.'
      });
      this.dialogRef.close({ authError: true, redirect: '/login' });
      return;
    }
    
    console.log('Proceeding with role picker, authentication will be confirmed on submission');
  }

  selectRole(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    this.selectedRole = role;
    
    // Reset academy creation form when changing roles
    if (role !== 'ACADEMY_OWNER') {
      this.isCreatingAcademy = false;
    }
  }

  confirmSelection() {
    if (this.selectedRole) {
      console.log('confirmSelection called with role:', this.selectedRole);
      
      // ถ้าเลือก ACADEMY_OWNER และยังไม่ได้อยู่ในหน้าสร้าง Academy
      if (this.selectedRole === 'ACADEMY_OWNER' && !this.isCreatingAcademy) {
        console.log('User selected ACADEMY_OWNER, showing academy creation form');
        this.isCreatingAcademy = true;
        return;
      }
      
      // ถ้ากำลังสร้าง Academy และกดปุ่ม confirm ให้ตรวจสอบค่าที่กรอก
      if (this.isCreatingAcademy && this.selectedRole === 'ACADEMY_OWNER') {
        console.log('User is creating academy as ACADEMY_OWNER, proceeding with combined flow');
        return this.createAcademyAndUpdateRole();
      }

      // If not creating academy, just update the role
      console.log('User is changing role without academy creation, proceeding with role update only');
      this.updateUserRole();
    } else {
      console.log('No role selected, cannot proceed');
      this.alertService.showAlert({
        type: 'error',
        message: 'Please select a role to continue'
      });
    }
  }

  // Method to handle both creating academy and updating user role
  private createAcademyAndUpdateRole() {
    // ตรวจสอบค่าที่กรอก
    if (!this.academyFormData.name.trim()) {
      this.alertService.showAlert({
        type: 'error',
        message: 'Please enter an academy name'
      });
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    // Get token from auth service
    const token = this.authService.getToken();
    if (!token) {
      this.alertService.showAlert({
        type: 'error',
        message: 'Authentication required. Please login again.'
      });
      this.redirectToLogin();
      return;
    }

    // STEP 1: First update the user role from GUEST to ACADEMY_OWNER
    // ข้อมูลที่จะส่งไปยัง API สำหรับอัพเดตบทบาท
    const roleRequestBody = {
      userId: this.userId,
      oldRole: this.currentRole,
      newRole: this.selectedRole
    };
    
    // API URL สำหรับอัพเดตบทบาท
    const roleApiUrl = `${environment.apiUrl}/roles/update`;
    
    // เพิ่ม headers แบบ explicit เพื่อตรวจสอบ
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
    });
    
    console.log('First updating user role to ACADEMY_OWNER:', roleRequestBody);
    
    // 1. First update the role
    this.http.put(roleApiUrl, roleRequestBody, { headers })
      .pipe(
        tap(response => {
          console.log('Role updated successfully to ACADEMY_OWNER:', response);
          this.alertService.showAlert({
            type: 'success',
            message: 'Your role has been updated to Academy Owner!'
          });
        }),
        switchMap(() => {
          // STEP 2: Now create the academy with the new role
          console.log('Now creating academy with new ACADEMY_OWNER role');
          
          // Create request body for academy creation
          const academyRequest: CreateAcademyRequest = {
            ownerId: this.userId,
            name: this.academyFormData.name,
            bio: this.academyFormData.bio || undefined
          };
          
          // Call the academy creation API
          return this.academiesService.createAcademy(academyRequest);
        }),
        tap(academyResponse => {
          console.log('Academy created successfully:', academyResponse);
          this.alertService.showAlert({
            type: 'success',
            message: 'Your academy has been created successfully!'
          });
        }),
        catchError(error => {
          console.error('Error in role update or academy creation:', error);
          
          let errorMessage = 'Failed to update role or create academy. Please try again.';
          
          if (error.status === 401) {
            errorMessage = 'Authentication failed. Please login again.';
            this.redirectToLogin();
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          this.alertService.showAlert({
            type: 'error',
            message: errorMessage
          });
          
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Complete process succeeded:', response);
          
          // Close dialog with updated role
          this.dialogRef.close(this.selectedRole);
          this.roleSelected.emit(this.selectedRole);
          
          // Force user to logout and login again with new role
          this.logoutAndRedirect(true);
        },
        error: () => {
          // Error already handled in the pipe
        }
      });
  }
  
  // Update user role without creating academy
  private updateUserRole() {
    if (!this.selectedRole) {
      console.error('updateUserRole called without a selected role');
      return;
    }
    
    console.log('updateUserRole: Starting role update process');
    console.log(`updateUserRole: Changing role from ${this.currentRole} to ${this.selectedRole}`);
    
    this.isLoading = true;
    this.errorMessage = null;

    // Get token from auth service
    const token = this.authService.getToken();
    
    // ถ้าไม่มี token ให้ redirect ไปหน้า login
    if (!token) {
      console.error('updateUserRole: No valid authentication token found');
      this.errorMessage = 'Authentication token not found. Please login again.';
      this.alertService.showAlert({
        type: 'error',
        message: 'You need to login to update your role.'
      });
      this.redirectToLogin();
      return;
    }
    
    // ตรวจสอบว่ามี userId หรือไม่
    if (!this.userId) {
      console.error('updateUserRole: User ID not found');
      this.errorMessage = 'User ID not found. Please login again.';
      this.alertService.showAlert({
        type: 'error',
        message: 'Cannot identify your user account. Please login again.'
      });
      this.redirectToLogin();
      return;
    }

    // ข้อมูลที่จะส่งไปยัง API
    const requestBody = {
      userId: this.userId,
      oldRole: this.currentRole,
      newRole: this.selectedRole
    };

    console.log('updateUserRole: Sending role update request:', requestBody);
    
    // API URL
    const apiUrl = `${environment.apiUrl}/roles/update`;
    
    // เพิ่ม headers แบบ explicit เพื่อตรวจสอบ
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
    });
    
    console.log('updateUserRole: Sending request to:', apiUrl);
    console.log('updateUserRole: Headers:', {
      contentType: headers.get('Content-Type'),
      authorization: headers.has('Authorization') ? 'Bearer token set (hidden)' : 'No token'
    });
    
    // ส่ง request โดยใส่ headers แบบ explicit
    this.http.put(apiUrl, requestBody, { headers })
      .pipe(
        tap(response => {
          console.log('updateUserRole: Role updated successfully in database:', response);
          this.alertService.showAlert({
            type: 'success',
            message: 'Your role has been updated successfully!'
          });
        }),
        catchError(error => {
          console.error('updateUserRole: Error updating role in database:', error);
          
          // แสดงข้อมูล error โดยละเอียดเพื่อแก้ไขปัญหา
          console.error('updateUserRole: Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          
          if (error.status === 401) {
            console.error('updateUserRole: Authentication error: Unauthorized. Your token may be invalid or expired.');
            this.errorMessage = 'Authentication failed. Please login again.';
            this.alertService.showAlert({
              type: 'error',
              message: 'Authentication failed. Please login again.'
            });
            this.redirectToLogin();
          } else if (error.status === 403) {
            console.error('updateUserRole: Authorization error: Forbidden. You may not have permission to update roles.');
            this.errorMessage = 'You do not have permission to update roles.';
            this.alertService.showAlert({
              type: 'error',
              message: 'You do not have permission to update roles. Please contact an administrator.'
            });
          } else if (error.status === 404) {
            console.error('updateUserRole: API endpoint not found. Please check the URL.');
            this.errorMessage = 'Role update endpoint not found.';
            this.alertService.showAlert({
              type: 'error',
              message: 'Role update endpoint not found. Please try again later.'
            });
          } else {
            console.error('updateUserRole: Unknown error occurred:', error);
            this.errorMessage = 'Failed to update role. Please try again.';
            this.alertService.showAlert({
              type: 'error',
              message: 'Failed to update role. Please try again.'
            });
          }
          
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
          console.log('updateUserRole: Request completed (success or error)');
        })
      )
      .subscribe({
        next: (response) => {
          console.log('updateUserRole: API response received:', response);
          
          // ปิด Dialog และส่งผลลัพธ์กลับ
          this.dialogRef.close(this.selectedRole);
          this.roleSelected.emit(this.selectedRole);
          
          // บังคับให้ผู้ใช้ออกจากระบบหลังเปลี่ยน role
          this.logoutAndRedirect(true);
        },
        error: (error) => {
          console.error('updateUserRole: Subscription error:', error);
          this.isLoading = false;
        }
      });
  }
  
  // ออกจากระบบและเปลี่ยนเส้นทางไปยังหน้า login
  private logoutAndRedirect(isDbUpdated: boolean = false): void {
    console.log('Logging out user after role change');
    
    // แสดงข้อความแจ้งเตือนผู้ใช้
    if (isDbUpdated) {
      this.alertService.showAlert({
        type: 'success',
        message: 'Your role has been updated successfully. You need to log in again with your new role.'
      });
    } else {
      this.alertService.showAlert({
        type: 'warning',
        message: 'Your role has been updated in the system (but not in the database due to authentication issues). You need to log in again with your new role.'
      });
    }
    
    // ออกจากระบบ
    this.authService.logout();
    
    // รอสักครู่แล้วเปลี่ยนเส้นทางไปยังหน้า login
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500); // เพิ่มเวลาให้มากขึ้นเพื่อให้ผู้ใช้เห็น alert
  }

  redirectToLogin() {
    this.dialogRef.close({ authError: true, redirect: '/login' });
  }

  close(redirectToLogin = false): void {
    if (redirectToLogin) {
      this.redirectToLogin();
    } else {
      this.dialogRef.close();
    }
  }

  refreshPage(): void {
    window.location.reload();
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

  // เพิ่มฟังก์ชั่นใหม่เพื่อตรวจสอบและลบ mock token
  private checkAndClearMockToken(): void {
    const token = localStorage.getItem('schoolie_token');
    if (token && token.startsWith('mock_token_')) {
      console.warn('Found mock token in localStorage, removing it and redirecting to login');
      localStorage.removeItem('schoolie_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_timestamp');
      
      this.alertService.showAlert({
        type: 'warning',
        message: 'Your session is invalid. Please login again.'
      });
      
      // ปิด dialog และส่ง flag ให้ redirect ไปหน้า login
      this.dialogRef.close({ authError: true, redirect: '/login' });
    }
  }
  
  // Back to role selection from academy creation form
  backToRoleSelection() {
    this.isCreatingAcademy = false;
  }
} 