import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if request is going to our API
    if (!request.url.includes(environment.apiUrl)) {
      // If not our API, pass through without modification
      return next.handle(request);
    }

    // Get the auth token from localStorage
    const authToken = localStorage.getItem('schoolie_token');
    
    console.log('Interceptor: Request URL =', request.url);
    
    // Skip token handling if request already has Authorization header
    // This prevents duplicate Authorization headers
    if (request.headers.has('Authorization')) {
      console.log('Interceptor: Request already has Authorization header, skipping token handling');
      return next.handle(request);
    }
    
    // Clone the request and set the default headers
    let modifiedRequest = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
    });
    
    // Add authorization token to headers if available
    if (authToken) {
      console.log('Interceptor: Adding token to request');
      
      // Make sure we don't add "Bearer" prefix if it's already there
      const tokenValue = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      
      modifiedRequest = modifiedRequest.clone({
        headers: modifiedRequest.headers.set('Authorization', tokenValue)
      });
    }

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Authentication error: Unauthorized access', error);
          // You may add redirection to login here if needed
        } else if (error.status === 403) {
          console.error('Authorization error: Forbidden access', error);
        } else if (error.status === 0) {
          console.error('Network error: Cannot connect to server', error);
        } else {
          console.error(`HTTP Error: ${error.status}`, error);
        }
        return throwError(() => error);
      })
    );
  }
} 