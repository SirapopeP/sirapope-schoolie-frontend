import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner 
      [isFullscreen]="true" 
      [isVisible]="isLoading">
    </app-loading-spinner>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'sirapope-schoolie-frontend';
  isLoading = false;

  constructor(private loadingService: LoadingService) {
    this.loadingService.loading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }
} 