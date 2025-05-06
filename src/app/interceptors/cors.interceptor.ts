import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only apply to API requests
    if (!request.url.includes(environment.apiUrl)) {
      return next.handle(request);
    }
    
    // Skip if Content-Type is already set
    if (request.headers.has('Content-Type')) {
      return next.handle(request);
    }
    
    // Clone the request with minimal required headers
    const corsReq = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json, text/plain, */*')
    });
    
    // Pass request to next interceptor/handler
    return next.handle(corsReq);
  }
} 