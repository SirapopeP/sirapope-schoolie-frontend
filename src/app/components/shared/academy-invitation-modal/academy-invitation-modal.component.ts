import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StudentManagementService, AcademyInvitation } from '../../../services/student-management.service';
import { AuthService } from '../../../services/auth.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ThemeService } from '../../../services/theme.service';

export interface AcademyInvitationDialogData {
  invitation: AcademyInvitation;
}

@Component({
  selector: 'app-academy-invitation-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './academy-invitation-modal.component.html',
  styleUrls: ['./academy-invitation-modal.component.scss']
})
export class AcademyInvitationModalComponent implements OnInit {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<AcademyInvitationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AcademyInvitationDialogData,
    private studentService: StudentManagementService,
    private authService: AuthService,
    private dialog: MatDialog,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Make sure we have the academy details in the invitation
    if (!this.data.invitation.academy) {
      this.dialogRef.close();
      this.showErrorMessage('Invalid invitation data.');
    }
  }

  // Get academy initials for the icon
  getAcademyInitials(): string {
    const academyName = this.data.invitation.academy?.name || '';
    
    if (!academyName) return '?';
    
    const words = academyName.split(' ');
    if (words.length === 1) {
      return academyName.substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  }

  // Accept invitation
  acceptInvitation(): void {
    this.respondToInvitation('ACCEPTED');
  }

  // Reject invitation
  rejectInvitation(): void {
    this.respondToInvitation('REJECTED');
  }

  // Common method for responding to invitation
  private respondToInvitation(status: 'ACCEPTED' | 'REJECTED'): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.showErrorMessage('Authentication required. Please login again.');
      this.isLoading = false;
      return;
    }

    this.studentService.respondToInvitation(
      this.data.invitation.id,
      currentUser.id,
      status
    ).subscribe({
      next: (invitation) => {
        this.isLoading = false;
        
        if (status === 'ACCEPTED') {
          this.showSuccessMessage('You have joined the academy successfully!');
        } else {
          this.showSuccessMessage('Invitation rejected successfully.');
        }
        
        this.dialogRef.close({ action: status.toLowerCase(), invitation });
      },
      error: (error) => {
        console.error(`Failed to ${status.toLowerCase()} invitation:`, error);
        this.isLoading = false;
        this.showErrorMessage(`Failed to ${status.toLowerCase()} invitation. Please try again.`);
      }
    });
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
  static open(dialog: MatDialog, data: AcademyInvitationDialogData): MatDialogRef<AcademyInvitationModalComponent> {
    return dialog.open(AcademyInvitationModalComponent, {
      width: '380px',
      autoFocus: false,
      panelClass: 'academy-invitation-dialog',
      data
    });
  }
}
