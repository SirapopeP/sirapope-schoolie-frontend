import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademyInvitationModalComponent } from './academy-invitation-modal.component';

describe('AcademyInvitationModalComponent', () => {
  let component: AcademyInvitationModalComponent;
  let fixture: ComponentFixture<AcademyInvitationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AcademyInvitationModalComponent]
    });
    fixture = TestBed.createComponent(AcademyInvitationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
