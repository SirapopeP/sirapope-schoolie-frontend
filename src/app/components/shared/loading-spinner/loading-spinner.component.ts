import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LoadingSpinnerComponent {
  @Input() isFullscreen: boolean = false;
  @Input() isVisible: boolean = true;
  @Input() spinnerColor: string = '#00ffc3';
  @Input() backdropColor: string = 'transparent';
} 