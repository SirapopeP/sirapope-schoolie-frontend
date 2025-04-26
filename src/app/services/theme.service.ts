import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

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