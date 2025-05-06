import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '@app/services/alert.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get auth token using the auth service
    const token = this.authService.getToken();
    
    console.log(`[Auth Interceptor] Processing request to ${request.url}`);
    console.log(`[Auth Interceptor] Token exists: ${!!token}`);
    
    // Skip if no token
    if (!token) {
      console.log('[Auth Interceptor] No token available');
      return next.handle(request);
    }
    
    // ตรวจสอบและไม่ใช้ mock token
    if (token.startsWith('mock_token_')) {
      console.error('[Auth Interceptor] Detected mock token, this will not work with the backend');
      // ล้าง localStorage ทันที
      localStorage.removeItem('schoolie_token');
      localStorage.removeItem('token_timestamp');
      
      // แสดงข้อความแจ้งเตือนผู้ใช้
      this.alertService.showAlert({
        type: 'error',
        message: 'Invalid authentication token detected. Please login again.'
      });
      
      // Redirect ไปหน้า login
      setTimeout(() => {
        this.router.navigate(['/login'], { 
          queryParams: { expired: 'true' } 
        });
      }, 1500);
      
      return throwError(() => new Error('Invalid mock token detected'));
    }
    
    let tokenToSend = token;
    // ตรวจสอบว่า token มี "Bearer " นำหน้าหรือไม่
    if (!token.startsWith('Bearer ')) {
      tokenToSend = `Bearer ${token}`;
    }
    
    console.log(`[Auth Interceptor] Using token: ${tokenToSend.substring(0, 20)}...`);
    
    // Clone request and add Authorization header with token
    const authReq = request.clone({
      headers: request.headers.set('Authorization', tokenToSend)
    });
    
    console.log(`[Auth Interceptor] Headers: ${Array.from(authReq.headers.keys()).join(', ')}`);
    console.log(`[Auth Interceptor] Authorization header: ${authReq.headers.get('Authorization')?.substring(0, 20)}...`);
    
    // Pass to next handler and handle errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle authentication errors
        if (error.status === 401) {
          console.error('[Auth Interceptor] Authentication error (401), clearing token and redirecting to login');
          // ล้าง token
          localStorage.removeItem('schoolie_token');
          localStorage.removeItem('token_timestamp');
          
          // แสดงข้อความแจ้งเตือนผู้ใช้
          this.alertService.showAlert({
            type: 'error',
            message: 'Your session has expired. Please login again.'
          });
          
          // Redirect ไปหน้า login หลังจากแสดง alert
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              queryParams: { expired: 'true' } 
            });
          }, 1500);
        }
        return throwError(() => error);
      })
    );
  }
} 