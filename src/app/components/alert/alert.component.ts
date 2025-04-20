// src/app/components/alert/alert.component.ts
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="alert" class="alert" [ngClass]="'alert-' + alert.type">
      {{ alert.message }}
    </div>
  `,
  styles: [`
    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }
    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    .alert-info {
      background-color: #cce5ff;
      color: #004085;
      border: 1px solid #b8daff;
    }
  `]
})
export class AlertComponent implements OnInit {
  alert: any;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
      // Auto hide after 5 seconds
      setTimeout(() => this.alert = null, 5000);
    });
  }
}