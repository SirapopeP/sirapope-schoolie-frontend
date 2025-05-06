import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../../models/user.model';
import { UserProfileService } from '../../../services/user-profile.service';
import { ProfileService } from '../../../services/profile.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 })),
      ]),
    ]),
  ]
})
export class UserProfileModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() userProfile: UserProfile | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileSaved = new EventEmitter<UserProfile>();

  profileForm: FormGroup;
  isEditMode = false;
  showForm = false;
  isLoading = false;
  formError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private profileService: ProfileService,
    @Inject(MatDialog) private dialog: MatDialog
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.userProfile) {
      this.isEditMode = true;
      this.patchFormValues(this.userProfile);
      this.showForm = true;
    } else {
      // Try to load the user profile on init
      this.loadUserProfile();
    }
  }
  
  async loadUserProfile(): Promise<void> {
    const user = this.userProfileService.getUser();
    if (!user) {
      console.error('No user found in UserProfileService');
      return;
    }
    
    try {
      console.log('Loading profile for user ID:', user.id);
      this.isLoading = true;
      
      this.profileService.getUserProfile(user.id).subscribe({
        next: (profile) => {
          if (profile) {
            console.log('Profile loaded successfully:', profile);
            this.userProfile = profile;
            this.isEditMode = true;
            this.patchFormValues(profile);
            this.showForm = true;
          } else {
            console.log('No profile exists for this user');
          }
        },
        error: (error) => {
          console.error('Failed to load user profile:', error);
          // If we get a 404, it means the profile doesn't exist yet
          if (error.status === 404) {
            console.log('Profile not found, user can create a new one');
          } else {
            this.handleApiError(error);
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.isLoading = false;
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required]],
      nickName: ['', [Validators.required]],
      birthDate: [''],
      bio: [''],
      avatarUrl: [''],
      phoneNumber: ['', [Validators.pattern('^[0-9]+$')]],
      address: ['']
    });
  }
  
  patchFormValues(profile: UserProfile): void {
    // Ensure all expected properties exist in the form
    this.profileForm.patchValue({
      fullName: profile.fullName || '',
      nickName: profile.nickName || '',
      birthDate: profile.birthDate || '',
      bio: profile.bio || '',
      avatarUrl: profile.avatarUrl || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || ''
    });
    
    console.log('Form patched with values:', this.profileForm.value);
  }

  showProfileForm(): void {
    this.showForm = true;
  }

  // Format the form data for API submission
  prepareFormData(): any {
    const formData = this.profileForm.value;
    
    // Add default avatar URL if not provided
    if (!formData.avatarUrl) {
      formData.avatarUrl = 'https://example.com/default-avatar.jpg';
    }
    
    // Make sure date is in the correct format
    if (formData.birthDate) {
      // Ensure consistent format for birth date
      const date = new Date(formData.birthDate);
      formData.birthDate = date.toISOString();
    }
    
    return formData;
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.formError = null;
      
      const formData = this.prepareFormData();
      console.log('Submitting form data:', formData);
      
      if (this.isEditMode) {
        // Update existing profile
        this.updateProfile(formData);
      } else {
        // Create new profile
        this.createProfile(formData);
      }
    } else {
      this.formError = 'Please fix the errors in the form before submitting.';
    }
  }
  
  createProfile(formData: any): void {
    console.log('Creating new user profile');
    this.profileService.createUserProfile(formData)
      .then(result => {
        console.log('Profile created successfully:', result);
        this.profileSaved.emit(result);
        this.close();
      })
      .catch(error => {
        console.error('Error creating profile:', error);
        this.handleApiError(error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  
  updateProfile(formData: any): void {
    console.log('Updating existing user profile');
    this.profileService.updateUserProfile(formData)
      .then(result => {
        console.log('Profile updated successfully:', result);
        this.profileSaved.emit(result);
        this.close();
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        this.handleApiError(error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  
  handleApiError(error: any): void {
    let errorMessage = 'There was a problem saving your profile. Please try again.';
    const isAuthError = error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 400 && error.error) {
        errorMessage = error.error.message || 'Invalid data provided. Please check your form.';
      }
    }
    
    // Set the form error message for all error types
    this.formError = errorMessage;
    
    // For authentication errors, also show a modal dialog as they require user action
    if (isAuthError) {
      this.showErrorAlert('Authentication Error', errorMessage);
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

  close(): void {
    this.isOpen = false;
    this.formError = null;
    this.closeModal.emit();
    
    // Reset the form display after closing animation would complete
    setTimeout(() => {
      this.showForm = this.isEditMode;
    }, 300);
  }
} 