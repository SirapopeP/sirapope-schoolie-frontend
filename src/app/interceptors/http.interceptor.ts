import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem('schoolie_token');
    
    console.log('Interceptor: Request URL =', request.url);
    console.log('Interceptor: Token found =', !!authToken);
    if (authToken) {
      console.log('Interceptor: Token value =', authToken.substring(0, 15) + '...');
    }
    
    // Clone the request and add the headers
    let modifiedRequest = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')
    });
    
    // Add authorization token to headers if available
    if (authToken) {
      modifiedRequest = modifiedRequest.clone({
        headers: modifiedRequest.headers.set('Authorization', `Bearer ${authToken}`)
      });
      
      console.log('Interceptor: Authorization header set to =', `Bearer ${authToken.substring(0, 15)}...`);
      console.log('Interceptor: All headers =', modifiedRequest.headers.keys());
    }

    return next.handle(modifiedRequest);
  }
} 