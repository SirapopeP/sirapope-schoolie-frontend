import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuPermission {
  menuId: string;
  menuName: string;
  allowedRoles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionService {
  private defaultPermissions: MenuPermission[] = [
    { 
      menuId: 'home', 
      menuName: 'Dashboard', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] 
    },
    { 
      menuId: 'workshop', 
      menuName: 'Workshop', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER'] 
    },
    { 
      menuId: 'student', 
      menuName: 'Students', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER'] 
    },
    { 
      menuId: 'teacher', 
      menuName: 'Teachers', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN'] 
    },
    { 
      menuId: 'options', 
      menuName: 'Options', 
      allowedRoles: ['ACADEMY_OWNER', 'ADMIN', 'TEACHER', 'STUDENT', 'GUEST'] 
    }
  ];

  private menuPermissionsSubject = new BehaviorSubject<MenuPermission[]>(this.getStoredPermissions());
  
  constructor() {
    console.log('MenuPermissionService initialized');
    // Initialize permissions if they don't exist
    if (!localStorage.getItem('menuPermissions')) {
      console.log('No stored permissions found, saving defaults');
      this.savePermissions(this.defaultPermissions);
    } else {
      console.log('Loaded stored permissions');
      console.log('Current permissions:', this.getStoredPermissions());
    }
  }

  get menuPermissions$(): Observable<MenuPermission[]> {
    return this.menuPermissionsSubject.asObservable();
  }

  getMenuPermissions(): MenuPermission[] {
    const permissions = this.menuPermissionsSubject.getValue();
    console.log('Getting menu permissions:', permissions);
    return permissions;
  }

  updateMenuPermissions(permissions: MenuPermission[]): void {
    console.log('Updating menu permissions:', permissions);
    this.savePermissions(permissions);
    this.menuPermissionsSubject.next(permissions);
  }

  resetToDefault(): void {
    console.log('Resetting permissions to default');
    this.savePermissions(this.defaultPermissions);
    this.menuPermissionsSubject.next(this.defaultPermissions);
  }

  canAccessMenu(menuId: string, userRoles: string[]): boolean {
    console.log(`Checking if user can access menu: ${menuId}, roles: ${userRoles}`);
    const permissions = this.getMenuPermissions();
    const menuPermission = permissions.find(p => p.menuId === menuId);
    
    if (!menuPermission) {
      console.log(`Menu ${menuId} not found in permissions`);
      return false;
    }

    console.log(`Menu ${menuId} allowed roles:`, menuPermission.allowedRoles);
    const hasAccess = userRoles.some(role => menuPermission.allowedRoles.includes(role));
    console.log(`Access to menu ${menuId}: ${hasAccess}`);
    return hasAccess;
  }

  private getStoredPermissions(): MenuPermission[] {
    const storedPermissions = localStorage.getItem('menuPermissions');
    const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : this.defaultPermissions;
    console.log('Retrieved stored permissions:', parsedPermissions);
    return parsedPermissions;
  }

  private savePermissions(permissions: MenuPermission[]): void {
    console.log('Saving permissions to localStorage:', permissions);
    localStorage.setItem('menuPermissions', JSON.stringify(permissions));
  }
} 