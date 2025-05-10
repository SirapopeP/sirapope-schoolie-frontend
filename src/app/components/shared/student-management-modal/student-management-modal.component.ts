import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StudentManagementService, Student, CreateStudentRequest } from '../../../services/student-management.service';
import { AuthService } from '../../../services/auth.service';
import { AcademiesService } from '../../../services';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ThemeService } from '../../../services/theme.service';

export interface StudentManagementDialogData {
  academyId: string;
}

@Component({
  selector: 'app-student-management-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './student-management-modal.component.html',
  styleUrls: ['./student-management-modal.component.scss']
})
export class StudentManagementModalComponent implements OnInit {
  // Form for creating new student
  createStudentForm: FormGroup;
  
  // List of available students to invite
  availableStudents: Student[] = [];
  filteredStudents: Student[] = [];
  
  // Loading state
  isLoading = false;
  searchTerm = '';
  
  // Selected tab
  selectedTabIndex = 0;
  
  constructor(
    public dialogRef: MatDialogRef<StudentManagementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentManagementDialogData,
    private fb: FormBuilder,
    private studentService: StudentManagementService,
    private authService: AuthService,
    private academiesService: AcademiesService,
    private dialog: MatDialog,
    public themeService: ThemeService
  ) {
    // Initialize the form
    this.createStudentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: [''],
      nickName: ['']
    });
    
    // Fix for iOS input background colors
    document.documentElement.style.setProperty('--webkit-autofill-background', 'transparent');
  }

  ngOnInit(): void {
    // Load available students when component initializes
    this.loadAvailableStudents(false);
  }

  // Method to load students without academy
  loadAvailableStudents(showLoadingIndicator: boolean = true): void {
    if (showLoadingIndicator) {
      this.isLoading = true;
    }
    
    this.studentService.getAvailableStudents().subscribe({
      next: (students) => {
        this.availableStudents = students;
        this.filteredStudents = [...students];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load available students:', error);
        this.showErrorMessage('Failed to load available students. Please try again.');
        this.isLoading = false;
      }
    });
  }

  // Method to create a new student
  createNewStudent(): void {
    if (this.createStudentForm.invalid) {
      this.markFormGroupTouched(this.createStudentForm);
      return;
    }

    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.showErrorMessage('Authentication required. Please login again.');
      this.isLoading = false;
      return;
    }

    const studentData: CreateStudentRequest = {
      ...this.createStudentForm.value,
      requesterId: currentUser.id
    };

    this.studentService.createStudent(this.data.academyId, studentData).subscribe({
      next: (student) => {
        this.isLoading = false;
        this.showSuccessMessage('Student created successfully!');
        this.resetForm();
        this.dialogRef.close({ action: 'created', student });
      },
      error: (error) => {
        console.error('Failed to create student:', error);
        this.isLoading = false;
        this.showErrorMessage('Failed to create student. Please try again.');
      }
    });
  }

  // Mark all form controls as touched to trigger validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Reset form after successful submission
  resetForm() {
    this.createStudentForm.reset();
  }

  // Method to invite an existing student
  inviteStudent(student: Student): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.showErrorMessage('Authentication required. Please login again.');
      this.isLoading = false;
      return;
    }

    this.studentService.inviteStudent(
      this.data.academyId, 
      student.id, 
      currentUser.id
    ).subscribe({
      next: (invitation) => {
        this.isLoading = false;
        this.showSuccessMessage(`Invitation sent to ${student.username}!`);
        
        // Remove invited student from the list
        this.availableStudents = this.availableStudents.filter(s => s.id !== student.id);
        this.filteredStudents = this.filteredStudents.filter(s => s.id !== student.id);
      },
      error: (error) => {
        console.error('Failed to invite student:', error);
        this.isLoading = false;
        this.showErrorMessage('Failed to send invitation. Please try again.');
      }
    });
  }

  // Filter students by search term
  filterStudents(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredStudents = [...this.availableStudents];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredStudents = this.availableStudents.filter(student => 
      student.username.toLowerCase().includes(term) || 
      student.email.toLowerCase().includes(term) ||
      (student.profile?.fullName && student.profile.fullName.toLowerCase().includes(term))
    );
  }

  // Switch to a specific tab programmatically
  switchToTab(index: number): void {
    if (this.selectedTabIndex !== index) {
      this.selectedTabIndex = index;
      
      // If switching to the existing students tab, load data
      if (index === 1) {
        // Add a small delay to load students after tab animation completes
        setTimeout(() => {
          this.loadAvailableStudents();
        }, 300);
      }
    }
  }

  // Show success message dialog
  private showSuccessMessage(message: string): void {
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: 'Success',
        message,
        type: 'success'
      }
    });
  }

  // Show error message dialog
  private showErrorMessage(message: string): void {
    this.dialog.open(AlertModalComponent, {
      width: '400px',
      data: {
        title: 'Error',
        message,
        type: 'error'
      }
    });
  }

  // Static method to open the dialog
  static open(dialog: MatDialog, data: StudentManagementDialogData): MatDialogRef<StudentManagementModalComponent> {
    return dialog.open(StudentManagementModalComponent, {
      width: '380px',
      autoFocus: false,
      data,
      panelClass: 'student-management-dialog'
    });
  }
}
