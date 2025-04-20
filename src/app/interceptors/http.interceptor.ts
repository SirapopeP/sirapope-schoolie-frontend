import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and add the headers
    const modifiedRequest = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')
    });

    return next.handle(modifiedRequest);
  }
} 