import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType, ChartData, ChartEvent, ActiveElement } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MarksheetService, PercentageGroup, StudentInfo } from '../Service/MarksheetService';
import { ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-percentage-graph',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './percentage-graph.html',
  styleUrls: ['./percentage-graph.css']
})
export class PercentageGraphComponent implements OnInit {
  chartType: 'bar' = 'bar';
@ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Number of Students',
        backgroundColor: '#3b82f6',
        barThickness: 40
      }
    ]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Student Percentage Distribution' }
    },
    scales: {
      x: { title: { display: true, text: 'Percentage Range' } },
      y: { beginAtZero: true }
    }
  };

  percentageDetails: { [range: string]: PercentageGroup } = {};
  selectedStudents: StudentInfo[] = [];

  constructor(private service: MarksheetService, private cdr: ChangeDetectorRef) {}

 ngOnInit(): void {
  this.service.getPercentageDistribution().subscribe({
    next: (res) => {
      this.chartData.labels = Object.keys(res);
      this.chartData.datasets[0].data = Object.values(res).map(r => r.count);
      this.percentageDetails = res;
      this.chart?.update(); // ✅ force chart redraw
      this.cdr.detectChanges(); // ✅ ensure Angular view updates
    }
  });
}



  handleChartClick(event?: ChartEvent, activeElements?: ActiveElement[]): void {
    if (activeElements && activeElements.length > 0) {
      const index = activeElements[0].index;
      const label = this.chartData.labels?.[index] as string;
      this.selectedStudents = this.percentageDetails[label]?.students || [];
      this.cdr.detectChanges(); // ensure student list updates
    }
  }
}
