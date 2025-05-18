import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentManagementModalComponent } from './student-management-modal.component';

describe('StudentManagementModalComponent', () => {
  let component: StudentManagementModalComponent;
  let fixture: ComponentFixture<StudentManagementModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StudentManagementModalComponent]
    });
    fixture = TestBed.createComponent(StudentManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
