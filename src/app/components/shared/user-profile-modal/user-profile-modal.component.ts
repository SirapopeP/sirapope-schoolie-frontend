import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../../models/user.model';
import { UserProfileService } from '../../../services/user-profile.service';
import { ProfileService } from '../../../services/profile.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

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
      this.profileForm.patchValue(this.userProfile);
      this.showForm = true;
    } else {
      // Try to load the user profile on init
      this.loadUserProfile();
    }
  }
  
  async loadUserProfile(): Promise<void> {
    const user = this.userProfileService.getUser();
    if (!user) return;
    
    try {
      const profile = await this.profileService.getUserProfile(user.id).toPromise();
      if (profile) {
        this.userProfile = profile;
        this.isEditMode = true;
        this.profileForm.patchValue(profile);
        this.showForm = true;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Profile doesn't exist for this user, keep isEditMode as false
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required]],
      nickName: ['', [Validators.required]],
      birthDate: [''],
      bio: [''],
      phoneNumber: ['', [Validators.pattern('^[0-9]+$')]],
      address: ['']
    });
  }

  showProfileForm(): void {
    this.showForm = true;
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formData = this.profileForm.value;
      
      try {
        let result: UserProfile;
        
        if (this.isEditMode) {
          // Update existing profile
          result = await this.profileService.updateUserProfile(formData);
          this.showSuccessAlert('Profile Updated', 'Your profile has been successfully updated.');
        } else {
          // Create new profile
          result = await this.profileService.createUserProfile(formData);
          this.showSuccessAlert('Profile Created', 'Your profile has been successfully created.');
        }
        
        // Emit the result to the parent component
        this.profileSaved.emit(result);
        
        // Close the modal
        this.close();
      } catch (error) {
        console.error('Error saving profile:', error);
        this.showErrorAlert('Error', 'There was a problem saving your profile. Please try again.');
      } finally {
        this.isLoading = false;
      }
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
    this.closeModal.emit();
    // Reset the form display after closing animation would complete
    setTimeout(() => {
      this.showForm = this.isEditMode;
    }, 300);
  }
} 