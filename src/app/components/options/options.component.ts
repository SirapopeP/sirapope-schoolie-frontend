import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MenuPermissionService, MenuPermission } from '../../services/menu-permission.service';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ]
})
export class OptionsComponent implements OnInit {
  isDarkMode = false;
  menuPermissions: MenuPermission[] = [];
  availableRoles = ['ACADEMY_OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'GUEST'];
  userRoles: string[] = [];
  isAdmin = false;

  constructor(
    private themeService: ThemeService,
    private menuPermissionService: MenuPermissionService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Get menu permissions
    this.menuPermissions = this.menuPermissionService.getMenuPermissions();

    // Get user roles
    const user = this.userProfileService.getUser();
    if (user && user.roles) {
      this.userRoles = user.roles;
      this.isAdmin = this.userRoles.includes('ADMIN') || this.userRoles.includes('ACADEMY_OWNER');
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  saveMenuPermissions(): void {
    this.menuPermissionService.updateMenuPermissions(this.menuPermissions);
  }

  resetToDefault(): void {
    this.menuPermissionService.resetToDefault();
    this.menuPermissions = this.menuPermissionService.getMenuPermissions();
  }

  hasRole(menu: MenuPermission, role: string): boolean {
    return menu.allowedRoles.includes(role);
  }

  toggleRole(menu: MenuPermission, role: string): void {
    if (this.hasRole(menu, role)) {
      menu.allowedRoles = menu.allowedRoles.filter(r => r !== role);
    } else {
      menu.allowedRoles.push(role);
    }
  }
} 