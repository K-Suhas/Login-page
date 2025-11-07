import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marksheet } from './marksheet';

describe('Marksheet', () => {
  let component: Marksheet;
  let fixture: ComponentFixture<Marksheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marksheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Marksheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
