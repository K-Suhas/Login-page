import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarksheetComponent } from './marksheet';

describe('Marksheet', () => {
  let component: MarksheetComponent;
  let fixture: ComponentFixture<MarksheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarksheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarksheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
