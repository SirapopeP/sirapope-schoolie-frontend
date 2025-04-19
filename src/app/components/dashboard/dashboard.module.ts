import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SidebarModule } from '../sidebar/sidebar.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { } 