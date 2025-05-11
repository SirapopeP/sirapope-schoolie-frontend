import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentCardComponent } from '../shared/student-card/student-card.component';
import { StudentListComponent } from '../shared/student-list/student-list.component';
import { StudentManagementService } from '../../services/student-management.service';
import { UserProfileService } from '../../services/user-profile.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StudentManagementModalComponent } from '../shared/student-management-modal/student-management-modal.component';
import { AcademiesService } from '../../services';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    StudentCardComponent,
    StudentListComponent,
    MatDialogModule,
    RouterModule
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
    trigger('staggerCards', [
      transition(':enter', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('80ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ]
})
export class StudentComponent implements OnInit, OnDestroy {
  students: any[] = [];
  isLoading = true;
  isDarkMode = false;
  currentAcademyId: string = '';
  private subscriptions: Subscription[] = [];
  
  constructor(
    private studentService: StudentManagementService,
    private userProfileService: UserProfileService,
    public themeService: ThemeService,
    private academiesService: AcademiesService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );
    
    // Load user and academy data, then fetch students
    this.subscriptions.push(
      this.userProfileService.user$.pipe(
        switchMap(user => {
          console.log('Current user:', user); // Debug log
          if (user && user.id && user.roles && user.roles.includes('ACADEMY_OWNER')) {
            return this.academiesService.getUserAcademies(user.id).pipe(
              switchMap(academies => {
                console.log('User academies:', academies); // Debug log
                
                if (!academies || academies.length === 0) {
                  console.error('No academies found for this user!');
                  this.isLoading = false;
                  return of([]);
                }
                
                if (academies && academies.length > 0) {
                  this.currentAcademyId = academies[0].id;
                  console.log(`Fetching students for academy ${this.currentAcademyId} with requesterID ${user.id}`); // Debug log
                  return this.studentService.getAcademyStudents(this.currentAcademyId, user.id);
                }
                return of([]);
              })
            );
          } else {
            console.error('User is not an ACADEMY_OWNER or missing user ID/roles');
            this.isLoading = false;
            return of([]);
          }
        }),
        catchError(error => {
          console.error('Error loading students:', error);
          this.showErrorAlert('Error', 'Failed to load students. Please try again later.');
          this.isLoading = false;
          return of([]);
        })
      ).subscribe(students => {
        console.log('Raw students data:', students);
        if (students && students.length > 0) {
          console.log('Student sample object keys:', Object.keys(students[0]));
          for (const student of students) {
            console.log(`Student ID ${student.id || 'unknown'}:`, student);
            if (student.profile) {
              console.log(`- Profile for student ${student.id || 'unknown'}:`, student.profile);
            }
            for (const key in student) {
              console.log(`- ${key}:`, student[key]);
            }
          }
        } else {
          console.log('No students found for this academy');
        }
        
        // Append academyId to each student for navigation purposes
        this.students = students.map(student => ({
          ...student,
          academyId: this.currentAcademyId
        }));
        this.isLoading = false;
      })
    );
  }
  
  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  openAddStudentModal() {
    if (!this.currentAcademyId) {
      this.showErrorAlert('No Academy Found', 'You must have an academy to manage students. Please create an academy first.');
      return;
    }

    StudentManagementModalComponent.open(this.dialog, {
      academyId: this.currentAcademyId
    }).afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'created' || result.action === 'invited') {
          this.showSuccessAlert(
            result.action === 'created' ? 'Student Created' : 'Invitation Sent',
            result.action === 'created' 
              ? 'The student has been successfully created and added to your academy.' 
              : 'An invitation has been sent to the student.'
          );
          // Refresh student list
          this.refreshStudents();
        }
      }
    });
  }
  
  refreshStudents() {
    if (this.currentAcademyId) {
      this.isLoading = true;
      
      // Get the current user ID to use as requesterId
      this.userProfileService.user$.pipe(
        take(1) // Take only the current value and complete
      ).subscribe(user => {
        if (user && user.id) {
          this.studentService.getAcademyStudents(this.currentAcademyId, user.id).subscribe({
            next: (students) => {
              // Append academyId to each student for navigation purposes
              this.students = students.map(student => ({
                ...student,
                academyId: this.currentAcademyId
              }));
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error refreshing students:', error);
              this.isLoading = false;
              this.showErrorAlert('Error', 'Failed to load students. Please try again later.');
            }
          });
        } else {
          this.isLoading = false;
          this.showErrorAlert('Error', 'User information not available. Please try again later.');
        }
      });
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