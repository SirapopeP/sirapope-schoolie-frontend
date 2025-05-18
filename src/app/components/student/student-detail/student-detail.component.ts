import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentManagementService } from '../../../services/student-management.service';
import { UserProfileService } from '../../../services/user-profile.service';
import { ThemeService } from '../../../services/theme.service';
import { ProfileService } from '../../../services/profile.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ParticlesComponent } from '../../particles/particles.component';
import { User, UserProfile } from '../../../models/user.model';

interface IncomeYear {
  year: number;
  isOpen: boolean;
  totalIncome: number;
  entries: IncomeEntry[];
}

interface IncomeEntry {
  date: Date;
  workshop: string;
  income: number | null;
}

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ParticlesComponent
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
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerItems', [
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
export class StudentDetailComponent implements OnInit, OnDestroy {
  student: any = null;
  isLoading = true;
  isDarkMode = false;
  studentId: string = '';
  academyId: string = '';
  workshops: any[] = [];
  studentNotes: any[] = [];
  memberIncome: any[] = [];
  incomeByYear: IncomeYear[] = [];
  totalIncome: number = 0;
  isStudentActive: boolean = true;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentManagementService,
    private userProfileService: UserProfileService,
    private profileService: ProfileService,
    public themeService: ThemeService
  ) {
    // Get state from navigation if available
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      if (state?.academyId) {
        this.academyId = state.academyId;
      }
    }
  }
  
  ngOnInit() {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );

    // We will rely on route params to load student details
    // Any navigation state will be accessed directly within the route params subscription if needed

    // Always subscribe to route params to handle direct access to URL or reloads
    this.subscriptions.push( // Add to subscriptions to unsubscribe on destroy
      this.route.params.subscribe(params => {
        const idFromRoute = params['id'] || params['studentId'];

        // Only load if studentId is present in route and it's a different student than currently loaded
        // Also check if a student object hasn't been set yet (initial load)
        if (idFromRoute && (this.studentId !== idFromRoute || !this.student || !this.student.id)) {
          this.studentId = idFromRoute;
          // Try to get academyId from route params if not already set
          // Can also try to get from navigation state here if preferred, but route params is more reliable for reloads
          const navigation = this.router.getCurrentNavigation();
          if (!this.academyId && params['academyId']) {
            this.academyId = params['academyId'];
          } else if (!this.academyId && navigation?.extras?.state?.['academyId']) {
             this.academyId = navigation.extras.state['academyId'];
          }

          console.log('Loading student details by ID from route:', this.studentId, 'Academy ID:', this.academyId);
          this.fetchAndSetStudentUserProfile(this.studentId); // Call the loading method directly
        } else if (!idFromRoute) {
          console.log('No student ID found in route parameters, loading dummy data');
          this.isLoading = false;
          this.loadDummyData();
        } else {
            console.log('Student ID from route is the same, or student is already loaded.', idFromRoute);
            // Ensure loading is off if we are skipping the load
            if (this.isLoading) {
                this.isLoading = false;
            }
        }
      })
    );
  }
  
  // Toggle student active status
  toggleStudentStatus() {
    this.isStudentActive = !this.isStudentActive;
    // In a real app, you would update the status in the database
    // this.studentService.updateStudentStatus(this.studentId, this.isStudentActive);
  }
  
  // Get initials from a full name (for avatar)
  getInitials(fullName: string | undefined): string {
    if (!fullName) return 'SN';
    
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  // Method to fetch and set the student's user profile and related data
  fetchAndSetStudentUserProfile(userId: string) {
    this.isLoading = true; // Set loading true when starting profile fetch
    console.log('Fetching and setting user profile for user ID:', userId);

    // Cancel previous profile subscription if exists to avoid race conditions
    if (this.subscriptions.find(sub => sub['__profile_sub'])) {
        const profileSubIndex = this.subscriptions.findIndex(sub => sub['__profile_sub']);
        this.subscriptions[profileSubIndex].unsubscribe();
        this.subscriptions.splice(profileSubIndex, 1);
        console.log('Unsubscribed from previous profile fetch.');
    }

    const profileSub = this.profileService.getUserProfile(userId).subscribe({
      next: (userProfile: UserProfile) => {
        console.log('Successfully loaded user profile data:', userProfile);

        // Construct student object with the user profile data
        this.student = {
            id: userId, // The ID used for fetching is the student's user ID
            user: { // Construct nested user object
              id: userId,
              username: userProfile.nickName || userProfile.fullName || '',
              email: '', // Email is not available in UserProfile interface as per model
              // If you get more user data from another source, merge it here
            },
            // Directly use properties from userProfile for student object if they match
            username: userProfile.nickName || userProfile.fullName || '', // Use nickname or full name for username
            email: '', // Email is not available in UserProfile interface
            profile: userProfile, // Assign the fetched userProfile
            academyId: this.academyId // Use the academyId captured from route/state
            // Add other student-specific properties here if available elsewhere
        };

        // Since UserProfile doesn't contain memberStatus, we assume active or get it from initial data if available
        // For now, default to true or you might need to fetch student status from another API if it's not in profile.
        this.isStudentActive = true; // Default to active, or fetch from another source

        // Format any dates or calculate derived values
        if (this.student.profile && this.student.profile.birthDate) {
          try {
            const date = new Date(this.student.profile.birthDate);
            if (!isNaN(date.getTime())) {
              this.student.profile.birthDate = date.toISOString().split('T')[0];
            } else {
               console.warn('Invalid birthDate format from profile:', this.student.profile.birthDate);
            }
          } catch (e) {
            console.warn('Could not parse birthDate:', this.student.profile.birthDate, e);
          }
        }

        // Now that we have the student data (including user profile), load related data
        const requesterId = this.userProfileService.getUser()?.id; // Get current logged-in user's ID
        const studentIdForRelatedData = this.student.id; // Use the student's user ID for related data APIs

        if (studentIdForRelatedData && requesterId) {
           console.log('Loading related data for student ID:', studentIdForRelatedData);
           this.loadWorkshopsForStudent(studentIdForRelatedData, requesterId);
           this.loadStudentNotesForStudent(studentIdForRelatedData, requesterId);
           this.loadMemberIncomeForStudent(studentIdForRelatedData, requesterId);
           this.isLoading = false; // Set loading false after initiating related data calls
        } else {
            console.warn('Missing student ID or requester ID for related data, skipping loading related data.');
            this.isLoading = false; // Ensure loading is off if related data cannot be loaded
        }

        // isLoading will be set to false after related data calls complete (or immediately if no related data calls)
      },
      error: (err) => {
        console.error('Error fetching and setting user profile:', err);
        this.isLoading = false; // Set loading false on error
        // Decide how to handle the error - show message, load dummy, etc.
        // this.loadDummyData(); // Fallback to dummy data on error if desired
        console.error('Failed to load student profile for ID:', userId);
        // You might want to show an error message to the user here
      }
    });
    // Mark this subscription for cleanup
    (profileSub as any)['__profile_sub'] = true; // Using a unique key
    this.subscriptions.push(profileSub);
  }
  
  // This method is no longer used directly for loading from route, consolidated into fetchAndSetStudentUserProfile
  // loadStudentDetailsFromRoute(studentId: string, academyId?: string) {
  //   console.log('loadStudentDetailsFromRoute is deprecated.');
  //   // Removed
  // }
  
  loadDummyData() {
    // Load dummy data for development/testing
    this.student = {
      id: this.studentId || '49eca38f-597b-415a-8405-0e2f4ba42c30',
      username: 'Student ' + (this.studentId || '49eca38f-597b-415a-8405-0e2f4ba42c30'),
      email: 'student@example.com',
      profile: {
        fullName: 'Student FullName',
        nickName: 'Student NickName',
        birthDate: '2010-01-01',
        bio: 'Sample student bio information'
      },
      memberLevel: 3,
      memberStatus: 'active',
      grade: 'B',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.isStudentActive = this.student.memberStatus === 'active';
    this.isLoading = false;
    
    // Load dummy related data
    this.loadWorkshops();
    this.loadStudentNotes();
    this.loadMemberIncome();
  }
  
  // Try to load workshops from API
  loadWorkshopsForStudent(studentId: string, userId: string) {
    console.log('Loading workshops for student:', studentId);
    
    // Check if studentService has a method to get workshops
    if (this.studentService.getStudentWorkshops) {
      this.studentService.getStudentWorkshops(studentId, userId).subscribe({
        next: (workshops: any[]) => {
          console.log('Successfully loaded workshops:', workshops);
          if (workshops && workshops.length > 0) {
            this.workshops = workshops.map(workshop => {
              // Map API data to the expected format if needed
              return {
                id: workshop.id,
                title: workshop.title || workshop.name || 'Workshop',
                date: new Date(workshop.date || workshop.startDate || workshop.createdAt),
                description: workshop.description || '',
                progress: workshop.progress || workshop.completedSteps || 2, // Default to 2 if no progress data
                completed: workshop.completed || workshop.isCompleted || false,
                // Add other properties as needed
              };
            });
          } else {
            // If no workshops found, load dummy data
            console.log('No workshops found, using dummy data');
            this.loadWorkshops();
          }
        },
        error: (err) => {
          console.error('Error loading workshops:', err);
          // Fallback to dummy data
          this.loadWorkshops();
        }
      });
    } else {
      // If no API method available, use dummy data
      console.log('No API method for workshops, using dummy data');
      this.loadWorkshops();
    }
  }
  
  // Try to load notes from API
  loadStudentNotesForStudent(studentId: string, userId: string) {
    console.log('Loading notes for student:', studentId);
    
    // Check if studentService has a method to get notes
    if (this.studentService.getStudentNotes) {
      this.studentService.getStudentNotes(studentId, userId).subscribe({
        next: (notes: any[]) => {
          console.log('Successfully loaded notes:', notes);
          if (notes && notes.length > 0) {
            this.studentNotes = notes.map(note => {
              // Map API data to the expected format if needed
              return {
                date: new Date(note.date || note.createdAt),
                note: note.note || note.content || note.text,
                // Add other properties as needed
              };
            });
          } else {
            // If no notes found, load dummy data
            console.log('No notes found, using dummy data');
            this.loadStudentNotes();
          }
        },
        error: (err) => {
          console.error('Error loading notes:', err);
          // Fallback to dummy data
          this.loadStudentNotes();
        }
      });
    } else {
      // If no API method available, use dummy data
      console.log('No API method for notes, using dummy data');
      this.loadStudentNotes();
    }
  }
  
  // Try to load income data from API
  loadMemberIncomeForStudent(studentId: string, userId: string) {
    console.log('Loading income for student:', studentId);
    
    // Check if studentService has a method to get income data
    if (this.studentService.getStudentIncome) {
      this.studentService.getStudentIncome(studentId, userId).subscribe({
        next: (incomeData: any) => {
          console.log('Successfully loaded income data:', incomeData);
          if (incomeData && Array.isArray(incomeData.items) && incomeData.items.length > 0) {
            // Process real income data and organize by year
            this.processMemberIncomeData(incomeData.items);
          } else {
            // If no income data found, load dummy data
            console.log('No income data found, using dummy data');
            this.loadMemberIncome();
          }
        },
        error: (err) => {
          console.error('Error loading income data:', err);
          // Fallback to dummy data
          this.loadMemberIncome();
        }
      });
    } else {
      // If no API method available, use dummy data
      console.log('No API method for income, using dummy data');
      this.loadMemberIncome();
    }
  }
  
  // Process real income data from API
  processMemberIncomeData(incomeItems: any[]) {
    const currentYear = new Date().getFullYear();
    const years: { [key: number]: IncomeYear } = {};
    let totalIncomeSum = 0;
    
    // Initialize empty years (current year and 4 years back)
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years[year] = {
        year,
        isOpen: i === 0, // Only current year is open by default
        totalIncome: 0,
        entries: []
      };
    }
    
    // Process each income item
    incomeItems.forEach(item => {
      try {
        const date = new Date(item.date || item.paymentDate || item.createdAt);
        const year = date.getFullYear();
        
        // Skip if year is not in our range
        if (!years[year]) return;
        
        const income = Number(item.amount || item.income || 0);
        if (isNaN(income)) return;
        
        // Add to year entries
        years[year].entries.push({
          date,
          workshop: item.workshop || item.description || item.title || 'Workshop',
          income
        });
        
        // Update year total
        years[year].totalIncome += income;
        totalIncomeSum += income;
      } catch (e) {
        console.warn('Error processing income item:', e, item);
      }
    });
    
    // Convert to array and sort by year (newest first)
    this.incomeByYear = Object.values(years).sort((a, b) => b.year - a.year);
    this.totalIncome = totalIncomeSum;
  }
  
  // Load workshop data (dummy data)
  loadWorkshops() {
    // Load dummy workshop data for demonstration
    this.workshops = [
      {
        id: '1',
        title: 'Workshop name',
        date: new Date(2023, 5, 15),
        description: 'Learn programming fundamentals, data structures, and basic algorithms',
        progress: 2, // out of 8 steps
        completed: false
      },
      {
        id: '2',
        title: 'Workshop name',
        date: new Date(2023, 6, 20),
        description: 'Learn web application development with Angular, TypeScript, and RxJS',
        progress: 2, // out of 8 steps
        completed: false
      },
      {
        id: '3',
        title: 'Workshop name',
        date: new Date(2023, 7, 10),
        description: 'Learn web application development with React and Redux',
        progress: 2, // out of 8 steps
        completed: false
      }
    ];
  }
  
  // Load student notes (dummy data)
  loadStudentNotes() {
    this.studentNotes = [
      { date: new Date(2025, 7, 15), note: 'Student progress note 1' },
      { date: new Date(2025, 7, 15), note: 'Student progress note 2' },
      { date: new Date(2025, 7, 15), note: 'Student progress note 3' }
    ];
  }
  
  // Load member income data (dummy data)
  loadMemberIncome() {
    const currentYear = new Date().getFullYear();
    
    // Generate 5 years worth of income data (current year and 4 years back)
    const years: IncomeYear[] = [];
    let totalIncomeSum = 0;
    
    // Create dummy data for demonstration
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const entries: IncomeEntry[] = [];
      
      // Add some random entries for each year
      // Current year is open by default, others closed
      if (i === 0) {
        // Current year - add some entries
        entries.push({ 
          date: new Date(year, 1, 15), 
          workshop: 'Watercolor Basics', 
          income: 6500 
        });
        entries.push({ 
          date: new Date(year, 4, 22), 
          workshop: 'Digital Art Workshop', 
          income: 7500 
        });
      } else if (i === 1) {
        // Last year
        entries.push({ 
          date: new Date(year, 7, 8), 
          workshop: 'Summer Art Camp', 
          income: 12000 
        });
        entries.push({ 
          date: new Date(year, 9, 12), 
          workshop: 'Drawing Fundamentals', 
          income: 5500 
        });
        entries.push({ 
          date: new Date(year, 11, 5), 
          workshop: 'Holiday Crafts', 
          income: 4000 
        });
      } else if (i === 2) {
        // 2 years ago
        entries.push({ 
          date: new Date(year, 3, 18), 
          workshop: 'Portrait Drawing', 
          income: 6000 
        });
      }
      
      // Calculate total income for this year
      const yearTotal = entries.reduce((sum, entry) => sum + (entry.income || 0), 0);
      totalIncomeSum += yearTotal;
      
      years.push({
        year,
        isOpen: i === 0, // Only current year is open by default
        totalIncome: yearTotal,
        entries
      });
    }
    
    this.incomeByYear = years;
    this.totalIncome = totalIncomeSum;
  }
  
  // Toggle accordion for year
  toggleYearAccordion(year: IncomeYear) {
    year.isOpen = !year.isOpen;
  }
  
  // Format date for display in Thai locale
  formatDate(date: Date): string {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
  
  // Format currency for display
  formatCurrency(amount: number | null): string {
    if (amount === null) return '-';
    return `${amount.toLocaleString()} ฿`;
  }
  
  calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // New direct navigation method to student list
  goToStudentList() {
    console.log('Using direct navigation to student list');
    
    // Direct URL navigation (most reliable approach)
    window.location.href = '/#/dashboard/student';
    
    // No fallbacks needed since this is a direct URL change
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 