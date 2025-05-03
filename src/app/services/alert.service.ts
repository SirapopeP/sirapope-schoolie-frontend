// src/app/services/alert.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  alert$ = this.alertSubject.asObservable();

  showAlert(alert: Alert) {
    console.log('AlertService: Showing alert -', alert.type, alert.message);
    this.alertSubject.next(alert);
  }
}