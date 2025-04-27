import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-object',
  templateUrl: './calendar-object.component.html',
  styleUrls: ['./calendar-object.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CalendarObjectComponent {
  @Input() month: string = '';
  @Input() days: { value: number, inactive?: boolean, active?: boolean }[] = [];
  @Input() legend: { color: string, label: string }[] = [];
  @Output() prevMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();
  @Output() today = new EventEmitter<void>();
} 