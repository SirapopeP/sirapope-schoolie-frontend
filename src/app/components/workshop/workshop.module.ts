import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WorkshopComponent } from './workshop.component';

const routes: Routes = [
  { path: '', component: WorkshopComponent }
];

@NgModule({
  declarations: [WorkshopComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class WorkshopModule { } 