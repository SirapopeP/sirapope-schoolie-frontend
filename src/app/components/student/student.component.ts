import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentCardComponent } from '../shared/student-card/student-card.component';
import { StudentListComponent } from '../shared/student-list/student-list.component';
import { StudentManagementService } from '../../services/student-management.service';
import { UserProfileService } from '../../services/user-profile.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription, of } from 'rxjs';
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
    this.loadStudents();
  }
  
  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Track student items by their ID for better NgFor performance
  trackByStudentId(index: number, student: any): string {
    return student.id;
  }
  
  loadStudents() {
    this.subscriptions.push(
      this.userProfileService.user$.pipe(
        switchMap(user => {
          if (user && user.id && user.roles && user.roles.includes('ACADEMY_OWNER')) {
            return this.academiesService.getUserAcademies(user.id).pipe(
              switchMap(academies => {
                if (!academies || academies.length === 0) {
                  this.isLoading = false;
                  return of([]);
                }
                
                if (academies && academies.length > 0) {
                  this.currentAcademyId = academies[0].id;
                  return this.studentService.getAcademyStudents(this.currentAcademyId, user.id);
                }
                return of([]);
              })
            );
          } else {
            this.isLoading = false;
            return of([]);
          }
        }),
        catchError(error => {
          this.showErrorAlert('Error', 'Failed to load students. Please try again later.');
          this.isLoading = false;
          return of([]);
        })
      ).subscribe(students => {
        // Append academyId to each student for navigation purposes
        this.students = students.map(student => ({
          ...student,
          academyId: this.currentAcademyId
        }));
        this.isLoading = false;
      })
    );
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