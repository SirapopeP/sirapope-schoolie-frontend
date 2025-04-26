import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LOGO_PATHS } from '../constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();
  
  // Logo paths
  readonly LOGO_MAIN_LIGHT = LOGO_PATHS.LOGO_MAIN_LIGHT;
  readonly LOGO_MAIN_DARK = LOGO_PATHS.LOGO_MAIN_DARK;
  readonly LOGO_MINI_LIGHT = LOGO_PATHS.LOGO_MINI_LIGHT;
  readonly LOGO_MINI_DARK = LOGO_PATHS.LOGO_MINI_DARK;

  constructor() {
    // Check if user has a preferred theme
    this.loadSavedTheme();
  }

  toggleDarkMode() {
    const newValue = !this.isDarkMode.value;
    this.isDarkMode.next(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    this.applyTheme(newValue);
  }

  // Get the appropriate logo based on current theme
  getMainLogo(): string {
    return this.isDarkMode.value ? this.LOGO_MAIN_DARK : this.LOGO_MAIN_LIGHT;
  }

  getMiniLogo(): string {
    return this.isDarkMode.value ? this.LOGO_MINI_DARK : this.LOGO_MINI_LIGHT;
  }

  private loadSavedTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme) {
      const isDark = savedTheme === 'true';
      this.isDarkMode.next(isDark);
      this.applyTheme(isDark);
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.next(prefersDarkMode);
      this.applyTheme(prefersDarkMode);
    }
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
} 