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
import { StudentManagementModalComponent } from '../shared/student-management-modal/student-management-modal.component';
import { StudentManagementService } from '../../services/student-management.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

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
    AlertModalComponent,
    StudentManagementModalComponent
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
  studentCount = 0; //linked
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

  // Track the academy ID for the current academy owner
  currentAcademyId: string = '';

  constructor(
    public themeService: ThemeService,
    private userProfileService: UserProfileService,
    private profileService: ProfileService,
    private academiesService: AcademiesService,
    @Inject(MatDialog) private dialog: MatDialog,
    private studentService: StudentManagementService,
    private router: Router
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
          academy: '',
          avatarUrl: user.profile?.avatarUrl || ''
        };
        
        // Attempt to load user's academy (if they're an owner)
        if (user.roles && user.roles.includes('ACADEMY_OWNER')) {
          this.loadAcademyData(user.id);
        }
      }
    });
    
    // Update today's date display
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
  
  // Handle Add Student button click
  openStudentManagementModal() {
    if (!this.currentAcademyId) {
      this.showErrorAlert('No Academy Found', 'You must have an academy to manage students. Please create an academy first.');
      return;
    }

    StudentManagementModalComponent.open(this.dialog, {
      academyId: this.currentAcademyId
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('Student management result:', result);
        
        if (result.action === 'created') {
          this.showSuccessAlert('Student Created', 'The student has been successfully created and added to your academy.');
          // Optionally refresh the student list here
          this.refreshStudentList();
        } else if (result.action === 'invited') {
          this.showSuccessAlert('Invitation Sent', 'An invitation has been sent to the student.');
        }
      }
    });
  }
  
  // Refresh student list after adding/inviting a student
  refreshStudentList() {
    // This would fetch the updated list of students from your backend
    // For now, we'll simulate it with a simple increment
    this.studentCount += 1;
  }
  
  // Load academy data for this owner
  private loadAcademyData(userId: string) {
    this.academiesService.getUserAcademies(userId).subscribe({
      next: (academies) => {
        if (academies && academies.length > 0) {
          const currentAcademy = academies[0]; // Use the first academy
          this.userProfile.academy = currentAcademy.name;
          this.currentAcademyId = currentAcademy.id;
          
          // Now load student count
          this.loadAcademyStudentCount(currentAcademy.id);
        }
      },
      error: (error) => {
        console.error('Error loading user academies:', error);
      }
    });
  }
  
  // Load the actual student count for this academy
  private loadAcademyStudentCount(academyId: string) {
    // Get current user's ID to use as requesterId
    this.userProfileService.user$.pipe(
      take(1) // Take only the current value and complete
    ).subscribe(user => {
      if (user && user.id) {
        console.log(`Loading student count for academy ${academyId} with requesterID ${user.id}`);
        this.studentService.getAcademyStudents(academyId, user.id).subscribe({
          next: (students) => {
            if (students) {
              this.studentCount = students.length;
              console.log(`Found ${students.length} students`);
            }
          },
          error: (error) => {
            console.error('Error loading academy students:', error);
          }
        });
      } else {
        console.error('User information not available for loading student count');
      }
    });
  }

  // Handle stat card action (+ button) clicks
  handleStatAction(title: string) {
    switch(title) {
      case 'STUDENTS':
        this.router.navigate(['/student']);
        break;
      case 'WORKSHOPS':
        // Navigate to workshops page
        break;
      case 'TEACHER':
        // Navigate to teachers page
        break;
      default:
        break;
    }
  }
} 