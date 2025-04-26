import { Component, OnInit, Inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { CreateAcademyModalComponent } from '../shared/create-academy-modal/create-academy-modal.component';
import { RolePickerModalComponent } from '../shared/role-picker-modal/role-picker-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    SidebarComponent,
    AlertModalComponent,
    CreateAcademyModalComponent,
    RolePickerModalComponent,
    MatDialogModule,
    MatButtonModule
  ]
})
export class DashboardComponent implements OnInit {
  isDashboardRoute: boolean = true; // Set default to true

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);
    
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.url);
    });
  }

  private checkRoute(url: string) {
    // Show buttons on main dashboard page and its child routes
    this.isDashboardRoute = url.startsWith('/dashboard') || url === '/';
  }

  openAlertModal() {
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: 'Test Alert',
        message: 'This is a test alert message',
        type: 'info'
      }
    });
  }

  openCreateAcademyModal() {
    this.dialog.open(CreateAcademyModalComponent, {
      width: '500px'
    });
  }

  openRolePickerModal() {
    this.dialog.open(RolePickerModalComponent, {
      width: '500px'
    });
  }
} 