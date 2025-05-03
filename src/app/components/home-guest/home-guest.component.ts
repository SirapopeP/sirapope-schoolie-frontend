import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';
import { CalendarObjectComponent } from '../shared/calendar-object/calendar-object.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { Router } from '@angular/router';
import { RolePickerModalComponent } from '../shared/role-picker-modal/role-picker-modal.component';
import { UserProfileService } from '@app/services';
import { UserProfile } from '@app/models/user.model';

@Component({
  selector: 'app-home-guest',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    CalendarObjectComponent,
    MatDialogModule,
    AlertModalComponent
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerList', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
  templateUrl: './home-guest.component.html',
  styleUrls: ['./home-guest.component.scss']
})
export class HomeGuestComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription: Subscription;
  private userSubscription: Subscription;
  currentUserProfile: UserProfile | null = null;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2

  // User profile data
  userProfile = {
    fullName: '',
    role: '',
    academy: '',
    avatarUrl: ''
  };

  // Statistics for guest dashboard
  stats = {
    workshops: 4,
    students: 6,
    teacher: 2,
    academyLevel: 3
  };

  constructor(
    public themeService: ThemeService,
    @Inject(MatDialog) private dialog: MatDialog,
    private router: Router,
    private userProfileService: UserProfileService
  ) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateThemeVariables();
    });

        // Subscribe to user profile changes
        this.userSubscription = this.userProfileService.user$.subscribe(user => {
            console.log('User data in home component:', user);
            
            if (user && user.id) { // Check that user object is complete
              // Format role for display (convert from SCREAMING_SNAKE_CASE to Title Case)
              let formattedRole = 'User';
              
              if (user.roles && user.roles.length > 0) {
                formattedRole = user.roles[0].replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
                  return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
                });
              }
              
              this.userProfile = {
                fullName: user.profile?.fullName || user.username || '',
                role: formattedRole,
                academy: 'User Academy', // Will update when academy info is available
                avatarUrl: user.profile?.avatarUrl || ''
              };
              
              console.log('Updated userProfile in home component:', this.userProfile);
              this.currentUserProfile = user.profile;
            } else {
              console.warn('Invalid or incomplete user data received in home component');
              // Default values if no user is available
              this.userProfile = {
                fullName: 'Anonymous User',
                role: 'Guest',
                academy: 'No Academy',
                avatarUrl: ''
              };
              
              this.currentUserProfile = null;
            }
        })
    };
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
  
  private updateThemeVariables() {
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  openRolePickerModal(): void {
    const dialogRef = RolePickerModalComponent.open(this.dialog);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected role:', result);
        this.handleRoleSelection(result);
      }
    });
  }

  handleRoleSelection(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT'): void {
    // Format the role for display
    let formattedRole = role.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
    
    // Show success message
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: 'Role Selected',
        message: `You have selected ${formattedRole} role. Redirecting to appropriate dashboard.`,
        type: 'success'
      },
      disableClose: false
    });

    // Route to the appropriate dashboard based on role
    setTimeout(() => {
      if (role === 'ACADEMY_OWNER') {
        this.router.navigate(['/dashboard/home']);
      } else if (role === 'TEACHER') {
        this.router.navigate(['/dashboard/home-teacher']);
      } else if (role === 'STUDENT') {
        this.router.navigate(['/dashboard/home-student']);
      }
    }, 1500);
  }
} 