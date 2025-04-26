import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AlertComponent } from './components/alert/alert.component';
import { LoginModule } from './components/login/login.module';
import { LoginComponent } from './components/login/login.component';

// กำหนด routes
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'change-password', component: ChangePasswordComponent }
  // เพิ่ม routes อื่นๆ ตามที่ต้องการ
];

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    LoginModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }