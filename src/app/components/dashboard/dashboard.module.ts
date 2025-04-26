import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SidebarModule } from '../sidebar/sidebar.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../shared/alert-modal/alert-modal.component';
import { CreateAcademyModalComponent } from '../shared/create-academy-modal/create-academy-modal.component';
import { RolePickerModalComponent } from '../shared/role-picker-modal/role-picker-modal.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { } 