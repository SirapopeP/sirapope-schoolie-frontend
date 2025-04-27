import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StatCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() gradient: string = '';
  @Input() actionLabel: string = '';
  @Input() gradientSvg: string = '';
} 