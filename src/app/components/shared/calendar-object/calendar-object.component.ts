import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CalendarDay {
  date: Date;
  value: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar-object',
  templateUrl: './calendar-object.component.html',
  styleUrls: ['./calendar-object.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CalendarObjectComponent implements OnInit {
  @Input() legend: { color: string, label: string }[] = [];
  @Output() dateSelected = new EventEmitter<Date>();

  // Calendar data
  currentDate = new Date();
  selectedDate = new Date();
  displayDate = new Date();
  calendarDays: CalendarDay[] = [];
  
  // Days of the week
  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Available years for selection
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  
  // Month names
  months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  ngOnInit() {
    // Initialize years dropdown (current year ±10 years)
    const currentYear = this.currentDate.getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      this.years.push(year);
    }
    
    // Set selected date to today
    this.selectedDate = new Date(this.currentDate);
    this.displayDate = new Date(this.currentDate);
    
    // Generate the calendar
    this.generateCalendar();
  }
  
  // Generate calendar days for current month view
  generateCalendar() {
    this.calendarDays = [];
    
    // Get current month's first and last day
    const firstDayOfMonth = new Date(
      this.displayDate.getFullYear(), 
      this.displayDate.getMonth(), 
      1
    );
    
    const lastDayOfMonth = new Date(
      this.displayDate.getFullYear(), 
      this.displayDate.getMonth() + 1, 
      0
    );
    
    // Get the day of week for first day (0 = Sunday)
    let firstDayWeekday = firstDayOfMonth.getDay();
    // Adjust for Monday as first day of week (0 = Monday)
    firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    
    // Add days from previous month
    const prevMonth = new Date(firstDayOfMonth);
    prevMonth.setDate(0); // Last day of previous month
    
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        daysInPrevMonth - i
      );
      
      this.calendarDays.push({
        date: date,
        value: date.getDate(),
        isCurrentMonth: false,
        isToday: this.isSameDay(date, this.currentDate),
        isSelected: this.isSameDay(date, this.selectedDate)
      });
    }
    
    // Add days from current month
    const daysInMonth = lastDayOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth(),
        i
      );
      
      this.calendarDays.push({
        date: date,
        value: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, this.currentDate),
        isSelected: this.isSameDay(date, this.selectedDate)
      });
    }
    
    // Add days from next month to fill remaining grid (max 6 rows × 7 days = 42 total cells)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth() + 1,
        i
      );
      
      this.calendarDays.push({
        date: date,
        value: i,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, this.currentDate),
        isSelected: this.isSameDay(date, this.selectedDate)
      });
    }
  }
  
  // Check if two dates are the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  }
  
  // Format date for display (e.g., "28 Dec 2023")
  formatDate(date: Date): string {
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  
  // Select a date
  selectDate(day: CalendarDay) {
    this.selectedDate = new Date(day.date);
    // Update all calendar days to reflect new selection
    this.calendarDays.forEach(d => {
      d.isSelected = this.isSameDay(d.date, this.selectedDate);
    });
    
    // Emit the selected date
    this.dateSelected.emit(this.selectedDate);
  }
  
  // Navigation: Previous month
  goToPreviousMonth() {
    this.displayDate = new Date(
      this.displayDate.getFullYear(),
      this.displayDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }
  
  // Navigation: Next month
  goToNextMonth() {
    this.displayDate = new Date(
      this.displayDate.getFullYear(),
      this.displayDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }
  
  // Navigation: Go to today
  goToToday() {
    this.displayDate = new Date(this.currentDate);
    this.selectedDate = new Date(this.currentDate);
    this.generateCalendar();
    this.dateSelected.emit(this.selectedDate);
  }
  
  // Change year
  onYearChange() {
    this.displayDate = new Date(
      this.selectedYear,
      this.displayDate.getMonth(),
      1
    );
    this.generateCalendar();
  }
  
  // Get current month name
  get currentMonthName(): string {
    return this.months[this.displayDate.getMonth()].toUpperCase();
  }
} 