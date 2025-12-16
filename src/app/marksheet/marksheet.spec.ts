// src/app/marksheet/marksheet.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarksheetComponent } from './marksheet';  // <-- matches your filename marksheet.ts

describe('MarksheetComponent', () => {
  let component: MarksheetComponent;
  let fixture: ComponentFixture<MarksheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarksheetComponent]   // standalone component goes in imports
    }).compileComponents();

    fixture = TestBed.createComponent(MarksheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
