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
import { Router } from '@angular/router';
import { AlertService } from '@app/services/alert.service';

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
    private themeService: ThemeService,
    private router: Router,
    private alertService: AlertService
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
  }

  confirmSelection() {
    if (this.selectedRole) {
      this.isLoading = true;
      this.errorMessage = null;

      // ล้าง localStorage ของ mock token ที่อาจมีอยู่
      const storedToken = localStorage.getItem('schoolie_token');
      if (storedToken && storedToken.startsWith('mock_token_')) {
        console.error('Found a mock token in localStorage - removing it');
        localStorage.removeItem('schoolie_token');
        this.alertService.showAlert({
          type: 'error',
          message: 'Invalid authentication token. Please login again.'
        });
        this.redirectToLogin();
        return;
      }

      // Get token from auth service
      const token = this.authService.getToken();
      
      // ถ้าไม่มี token หรือเป็น mock token ให้ redirect ไปหน้า login
      if (!token) {
        console.error('No valid authentication token found. Please login again.');
        this.errorMessage = 'Authentication token not found. Please login again.';
        this.alertService.showAlert({
          type: 'error',
          message: 'You need to login to update your role.'
        });
        this.redirectToLogin();
        return;
      }
      
      // ตรวจสอบว่าเป็น mock token หรือไม่
      if (token.startsWith('mock_token_')) {
        console.error('Mock token detected. This will not work with the real API.');
        localStorage.removeItem('schoolie_token');
        this.alertService.showAlert({
          type: 'error',
          message: 'Invalid authentication token. Please login again.'
        });
        this.redirectToLogin();
        return;
      }
      
      // Debug log the token status
      console.log('Authentication status before request:', {
        hasToken: !!token,
        userId: this.userId || 'missing'
      });
      
      // ตรวจสอบว่ามี userId หรือไม่
      if (!this.userId) {
        console.error('User ID not found. Cannot update role without a valid user ID.');
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

      console.log('Role update request:', requestBody);
      
      // API URL
      const apiUrl = `${environment.apiUrl}/roles/update`;
      console.log('API URL:', apiUrl);
      
      // เพิ่ม headers แบบ explicit เพื่อตรวจสอบ
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
      });
      
      console.log('Headers being sent:', headers.keys());
      console.log('Authorization header:', headers.get('Authorization')?.substring(0, 20) + '...');
      
      // ส่ง request โดยใส่ headers แบบ explicit
      this.http.put(apiUrl, requestBody, { headers })
        .pipe(
          tap(response => {
            console.log('Role updated successfully in database:', response);
            this.alertService.showAlert({
              type: 'success',
              message: 'Your role has been updated successfully!'
            });
          }),
          catchError(error => {
            console.error('Error updating role in database:', error);
            
            // แสดงข้อมูล error โดยละเอียดเพื่อแก้ไขปัญหา
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });
            
            if (error.status === 401) {
              console.error('Authentication error: Unauthorized. Your token may be invalid or expired.');
              this.errorMessage = 'Authentication failed. Please login again.';
              this.alertService.showAlert({
                type: 'error',
                message: 'Authentication failed. Please login again.'
              });
              this.redirectToLogin();
            } else if (error.status === 404) {
              console.error('API endpoint not found. Please check the URL.');
              this.errorMessage = 'API endpoint not found.';
              this.alertService.showAlert({
                type: 'error',
                message: 'API endpoint not found. Please try again later.'
              });
            } else {
              console.error('Unknown error occurred:', error);
              this.errorMessage = 'Failed to update role. Please try again.';
              this.alertService.showAlert({
                type: 'error',
                message: 'Failed to update role. Please try again.'
              });
            }
            
            // ปรับเป็น throw เพื่อหยุดการทำงานเมื่อเกิดข้อผิดพลาด
            throw error;
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log('API response:', response);
            
            // ปิด Dialog และส่งผลลัพธ์กลับ
            this.dialogRef.close(this.selectedRole);
            this.roleSelected.emit(this.selectedRole);
            
            // บังคับให้ผู้ใช้ออกจากระบบหลังเปลี่ยน role
            this.logoutAndRedirect(true); // ส่งพารามิเตอร์ true เพื่อแสดงว่าอัพเดตฐานข้อมูลสำเร็จ
          },
          error: (error) => {
            console.error('Subscription error:', error);
            this.isLoading = false;
            // ไม่ต้อง logout เมื่อเกิดข้อผิดพลาด
          }
        });
    }
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
} 