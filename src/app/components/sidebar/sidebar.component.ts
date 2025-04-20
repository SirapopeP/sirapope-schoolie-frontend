import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  onLogout() {
    // Clear user data from storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    // Show success message
    this.alertService.showAlert({
      type: 'success',
      message: 'Logged out successfully'
    });

    // Navigate to login page
    this.router.navigate(['/login']);
  }
} 