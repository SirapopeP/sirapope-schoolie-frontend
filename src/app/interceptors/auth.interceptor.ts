import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '@app/services/alert.service';
import { environment } from '@env';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip non-API requests
    if (!request.url.includes(environment.apiUrl)) {
      return next.handle(request);
    }
    
    // Skip if the request already has Authorization header
    if (request.headers.has('Authorization')) {
      console.log('[Auth Interceptor] Request already has Authorization header, skipping token handling');
      return next.handle(request);
    }
    
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
      localStorage.removeItem('token');
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
    
    // Pass to next handler and handle errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle specific error types
        if (error.status === 401) {
          console.error('[Auth Interceptor] Authentication error (401), clearing token and redirecting to login');
          // Clear all auth-related data
          localStorage.removeItem('schoolie_token');
          localStorage.removeItem('token');
          localStorage.removeItem('token_timestamp');
          localStorage.removeItem('user');
          localStorage.removeItem('schoolie_user');
          
          // Show user alert
          this.alertService.showAlert({
            type: 'error',
            message: 'Your session has expired. Please login again.'
          });
          
          // Redirect to login after alert
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              queryParams: { expired: 'true' } 
            });
          }, 1500);
        } 
        else if (error.status === 403) {
          console.error('[Auth Interceptor] Authorization error (403), user does not have permission');
          
          // Check for specific endpoints
          if (request.url.includes('/academies')) {
            console.error('[Auth Interceptor] Forbidden error for academy endpoint - user likely needs ACADEMY_OWNER role');
            this.alertService.showAlert({
              type: 'error',
              message: 'You need to be an Academy Owner to perform this action. Please update your role first.'
            });
          } else if (request.url.includes('/roles/update')) {
            console.error('[Auth Interceptor] Forbidden error for role update - may need admin permissions');
            this.alertService.showAlert({
              type: 'error',
              message: 'You do not have permission to update roles. Please contact an administrator.'
            });
          } else {
            this.alertService.showAlert({
              type: 'error',
              message: 'You do not have permission to perform this action. Please contact an administrator.'
            });
          }
        }
        else if (error.status === 404) {
          console.error('[Auth Interceptor] Resource not found (404):', error.url);
          
          if (request.url.includes('/academies')) {
            this.alertService.showAlert({
              type: 'error',
              message: 'Academy resource not found. The API endpoint may not be available.'
            });
          } else if (request.url.includes('/roles/update')) {
            this.alertService.showAlert({
              type: 'error',
              message: 'Role update endpoint not found. Please contact an administrator.'
            });
          }
        }
        else if (error.status === 0) {
          console.error('[Auth Interceptor] Network error, cannot connect to server');
          
          this.alertService.showAlert({
            type: 'error',
            message: 'Cannot connect to server. Please check your internet connection and try again.'
          });
        }
        
        return throwError(() => error);
      })
    );
  }
} 