import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RolePickerModalComponent } from '../shared/role-picker-modal/role-picker-modal.component';
import { CreateAcademyModalComponent } from '../shared/create-academy-modal/create-academy-modal.component';
import { RolesService, AcademiesService, AuthService } from '../../services';

@Component({
  selector: 'app-pickup-role',
  standalone: true,
  imports: [CommonModule, RolePickerModalComponent, CreateAcademyModalComponent],
  templateUrl: './pickup-role.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PickupRoleComponent implements OnInit {
  constructor(
    private rolesService: RolesService,
    private academiesService: AcademiesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkUserRole();
  }

  private async checkUserRole() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      const roles = await this.rolesService.getUserRoles(user.id);
      if (roles.length > 0) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  openRolePicker() {
    const rolePicker = document.querySelector('app-role-picker-modal') as any;
    rolePicker?.openModal();
  }

  async onRoleSelected(role: 'ACADEMY_OWNER' | 'TEACHER' | 'STUDENT') {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      await this.rolesService.assignUserRole(user.id, role);

      if (role === 'ACADEMY_OWNER') {
        const createAcademy = document.querySelector('app-create-academy-modal') as any;
        createAcademy?.openModal();
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  }

  async onAcademyCreated(academyData: any) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      await this.academiesService.createAcademy(user.id, academyData);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error creating academy:', error);
    }
  }
}
