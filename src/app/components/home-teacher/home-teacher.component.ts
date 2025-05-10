import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';
import { CalendarObjectComponent } from '../shared/calendar-object/calendar-object.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { UserProfileService } from '../../services/user-profile.service';
import { ProfileService } from '../../services/profile.service';
import { User, UserProfile } from '../../models/user.model';
import { UserProfileModalComponent } from '../shared/user-profile-modal/user-profile-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';

@Component({
  selector: 'app-home-teacher',
  standalone: true,
  imports: [
    CommonModule, 
    StatCardComponent, 
    CalendarObjectComponent, 
    UserProfileModalComponent,
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
  templateUrl: './home-teacher.component.html',
  styleUrls: ['./home-teacher.component.scss']
})
export class HomeTeacherComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  private themeSubscription: Subscription;
  private userSubscription: Subscription;
  
  // Theme variables
  primaryColorRgb = '29, 216, 178'; // RGB for #1DD8B2
  
  // User profile data
  userProfile = {
    fullName: '',
    role: '',
    academy: '',
    avatarUrl: ''
  };
  
  // User profile modal
  isProfileModalOpen = false;
  currentUserProfile: UserProfile | null = null;
  
  // Dashboard statistics
  classCount = 0;
  studentCount = 0;
  completedClassesCount = 0;
  ratingScore = 0;
  
  // Current month and date
  selectedDate = new Date(); // For the selected date from calendar
  formattedSelectedDate = ''; // Formatted date for display
  
  // Class schedules
  schedules = [
    { 
      id: 1, 
      title: 'Art Mixing 101', 
      date: '2023-11-12', 
      time: '14:00 - 16:00',
      students: 5
    },
    { 
      id: 2, 
      title: 'Oil Painting Basics', 
      date: '2023-11-15', 
      time: '10:00 - 12:00',
      students: 3
    }
  ];
  
  // Student list
  students = [
    {
      id: 1,
      name: 'John Smith',
      course: 'Art Mixing 101',
      progress: 75,
      lastAttended: '2023-11-05'
    },
    {
      id: 2,
      name: 'Mary Johnson',
      course: 'Art Mixing 101',
      progress: 60,
      lastAttended: '2023-11-07'
    },
    {
      id: 3,
      name: 'Robert Brown',
      course: 'Oil Painting Basics',
      progress: 30,
      lastAttended: '2023-11-04'
    }
  ];
  
  // Stat card icons
  statIcons = {
    class: 'fas fa-chalkboard',
    student: 'fas fa-user-graduate',
    completed: 'fas fa-check-circle',
    rating: 'fas fa-star',
  };
  statGradients = [
    'assets/styles/gg-1.svg',
    'assets/styles/gg-2.svg',
    'assets/styles/gg-3.svg',
    'assets/styles/gg-4.svg',
  ];

  constructor(
    public themeService: ThemeService,
    private userProfileService: UserProfileService,
    private profileService: ProfileService,
    @Inject(MatDialog) private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateThemeVariables();
    });
    
    // Subscribe to user profile changes
    this.userSubscription = this.userProfileService.user$.subscribe(user => {
      console.log('User data in home-teacher component:', user);
      
      if (user && user.id) { // Check that user object is complete
        // Format role for display (convert from SCREAMING_SNAKE_CASE to Title Case)
        let formattedRole = 'Teacher';
        
        if (user.roles && user.roles.length > 0) {
          formattedRole = user.roles[0].replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
          });
        }
        
        this.userProfile = {
          fullName: user.profile?.fullName || user.username || '',
          role: formattedRole,
          academy: user.profile?.bio || 'No bio available', // Display user bio instead of academy name
          avatarUrl: user.profile?.avatarUrl || ''
        };
        
        console.log('Updated userProfile in home-teacher component:', this.userProfile);
        this.currentUserProfile = user.profile;
      } else {
        console.warn('Invalid or incomplete user data received in home-teacher component');
        // Default values if no user is available
        this.userProfile = {
          fullName: 'Anonymous User',
          role: 'Guest',
          academy: 'No bio available',
          avatarUrl: ''
        };
        
        this.currentUserProfile = null;
      }
    });
    
    this.updateThemeVariables();
    
    // Initialize formatted date
    this.updateFormattedDate(this.selectedDate);
  }
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  private updateThemeVariables() {
    document.documentElement.style.setProperty('--primary-color-rgb', this.primaryColorRgb);
  }
  
  // Handle date selection from calendar
  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.updateFormattedDate(date);
  }
  
  // Format date as "DD MMM YYYY"
  private updateFormattedDate(date: Date) {
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    this.formattedSelectedDate = `${day} ${month} ${year}`;
  }
  
  // Open profile modal
  openProfileModal() {
    this.isProfileModalOpen = true;
  }
  
  // Close profile modal
  closeProfileModal() {
    this.isProfileModalOpen = false;
  }
  
  // Handle profile save/update
  async onProfileSaved(profileData: UserProfile) {
    try {
      if (this.currentUserProfile) {
        // Update existing profile
        await this.profileService.updateUserProfile(profileData);
        this.showSuccessAlert('Profile Updated', 'Your profile has been successfully updated.');
      } else {
        // Create new profile
        await this.profileService.createUserProfile(profileData);
        this.showSuccessAlert('Profile Created', 'Your profile has been successfully created.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showErrorAlert('Error', 'There was a problem saving your profile. Please try again.');
    }
  }
  
  showSuccessAlert(title: string, message: string): void {
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
        type: 'success'
      },
      disableClose: false
    });
  }
  
  showErrorAlert(title: string, message: string): void {
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
        type: 'error'
      },
      disableClose: false
    });
  }
} 