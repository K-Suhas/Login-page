import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageGraphComponent } from './percentage-graph';


describe('PercentageGraph', () => {
  let component: PercentageGraphComponent;
  let fixture: ComponentFixture<PercentageGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentageGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PercentageGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
