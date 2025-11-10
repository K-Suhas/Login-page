import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MarksheetService } from '../Service/MarksheetService';

@Component({
  selector: 'app-percentage-graph',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './percentage-graph.html',
  styleUrls: ['./percentage-graph.css']
})
export class PercentageGraphComponent implements OnInit {
  labels: string[] = [];
  data: number[] = [];

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Student Percentage Distribution' }
    }
  };

 chartType: 'bar' = 'bar';
  

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Number of Students',
        backgroundColor: '#3b82f6',
        barThickness:40
      }
    ]
  };

  constructor(private service: MarksheetService) {}

  ngOnInit(): void {
    this.service.getPercentageDistribution().subscribe({
      next: (res: { [key: string]: number }) => {
        this.chartData.labels = Object.keys(res);
        this.chartData.datasets[0].data = Object.values(res);
      }
    });
  }
}
