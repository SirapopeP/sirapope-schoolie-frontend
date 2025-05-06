import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request with minimal required headers
    // ไม่ต้องใส่ headers เกี่ยวกับ CORS เนื่องจากควรตั้งค่าที่ฝั่ง server
    const corsReq = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json, text/plain, */*')
    });
    
    // Pass request to next interceptor/handler
    return next.handle(corsReq);
  }
} 