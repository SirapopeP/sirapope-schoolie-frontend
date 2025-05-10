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
import { AcademiesService } from '../../services';

interface Workshop {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Student {
  id: number;
  name: string;
  age: number;
  workshop: string;
  sessionDate: string;
  sessionDetail: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
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
  workshopCount = 4;
  studentCount = 6;
  teacherCount = 2;
  academyLevel = 3;
  
  // Workshops list
  workshops: Workshop[] = [
    { id: 1, title: 'Art Mixing 101', status: 'active' },
    { id: 2, title: 'Art Mixing 107', status: 'active' },
    { id: 3, title: 'Art DIY 109', status: 'cancelled' },
    { id: 4, title: 'Art DIY 109', status: 'cancelled' },
    { id: 5, title: 'Art DIY 109', status: 'cancelled' },
    { id: 6, title: 'Art DIY 109', status: 'cancelled' },
    { id: 7, title: 'Art DIY 109', status: 'cancelled' },
    { id: 8, title: 'Art DIY 109', status: 'cancelled' },
    { id: 9, title: 'Art DIY 109', status: 'cancelled' },
    { id: 10, title: 'Art DIY 109', status: 'cancelled' },
    
  ];
  
  // Students list
  students: Student[] = [
    { 
      id: 1, 
      name: 'Sirapope Panapong', 
      age: 18, 
      workshop: 'Art Mixing 101', 
      sessionDate: '4/12', 
      sessionDetail: 'สีน้ำ + ภาพวาด' 
    },
    { 
      id: 2, 
      name: 'Sunny Lerumin', 
      age: 4, 
      workshop: 'Art Mixing 101', 
      sessionDate: '7/12', 
      sessionDetail: 'สีน้ำมัน + ภาพหมือน' 
    },
    { 
      id: 3, 
      name: 'Lion Gategara', 
      age: 8, 
      workshop: 'Art Mixing 101', 
      sessionDate: '2/12', 
      sessionDetail: 'สีน้ำ + การ์ตูน' 
    },
    { 
      id: 4, 
      name: 'Lion Gategara', 
      age: 8, 
      workshop: 'Art Mixing 101', 
      sessionDate: '2/12', 
      sessionDetail: 'สีน้ำ + การ์ตูน' 
    }
  ];
  
  // Current month and date
  selectedDate = new Date(); // For the selected date from calendar
  formattedSelectedDate = ''; // Formatted date for display
  
  // Stat card icons (ใช้ class จาก fontawesome/material-icons)
  statIcons = {
    student: 'fas fa-user-graduate',
    workshop: 'fas fa-paint-brush',
    teacher: 'fas fa-chalkboard-teacher',
    achievement: 'fas fa-star',
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
    private academiesService: AcademiesService,
    @Inject(MatDialog) private dialog: MatDialog
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
          academy: 'Loading academy...', // Placeholder until we fetch the actual academy
          avatarUrl: user.profile?.avatarUrl || ''
        };
        
        // Fetch academy information if user is ACADEMY_OWNER
        if (user.roles && user.roles.includes('ACADEMY_OWNER')) {
          this.academiesService.getUserAcademies(user.id).subscribe(
            academies => {
              if (academies && academies.length > 0) {
                this.userProfile.academy = academies[0].name;
              } else {
                this.userProfile.academy = 'No Academy';
              }
              console.log('Updated academy in home component:', this.userProfile.academy);
            },
            error => {
              console.error('Error fetching user academies:', error);
              this.userProfile.academy = 'Academy Unavailable';
            }
          );
        }
        
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
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'bg-success text-white';
      case 'cancelled': return 'bg-error text-white';
      default: return 'bg-info text-white';
    }
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