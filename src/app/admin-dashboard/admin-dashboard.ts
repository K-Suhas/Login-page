import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../Service/AdminService';
import { MailService } from '../Service/MailService';
import { Router } from '@angular/router';
import { PercentageGraphComponent } from '../percentage-graph/percentage-graph';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PercentageGraphComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  students: any[] = [];
  courses: any[] = [];
  loading = true;

  // Mail form fields
  toEmail: string = 'ALL';
  subject: string = '';
  body: string = '';
  mailMessage: string = '';

  studentPage = 0;
  coursePage = 0;
  pageSize = 5;

  constructor(
    private adminService: AdminService,
    private mailService: MailService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminService.getDashboardData().subscribe({
      next: data => {
        this.students = data.students;
        this.courses = data.courses;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load dashboard:', err);
        this.loading = false;
      }
    });
  }

  // Pagination helpers
  get paginatedStudents(): any[] {
    const start = this.studentPage * this.pageSize;
    return this.students.slice(start, start + this.pageSize);
  }

  get paginatedCourses(): any[] {
    const start = this.coursePage * this.pageSize;
    return this.courses.slice(start, start + this.pageSize);
  }

  prevStudentPage() {
    if (this.studentPage > 0) this.studentPage--;
  }
  nextStudentPage() {
    if ((this.studentPage + 1) * this.pageSize < this.students.length) {
      this.studentPage++;
    }
  }

  prevCoursePage() {
    if (this.coursePage > 0) this.coursePage--;
  }
  nextCoursePage() {
    if ((this.coursePage + 1) * this.pageSize < this.courses.length) {
      this.coursePage++;
    }
  }

  // Mail sending
  sendMail() {
    if (this.toEmail === 'ALL') {
      this.mailService.sendToAll(this.subject, this.body).subscribe({
        next: () => this.mailMessage = '✅ Mail sent to all students!',
        error: err => this.mailMessage = '❌ Error: ' + (err.error?.message || 'Failed to send')
      });
    } else {
      this.mailService.sendToOne(this.toEmail, this.subject, this.body).subscribe({
        next: () => this.mailMessage = `✅ Mail sent to ${this.toEmail}!`,
        error: err => this.mailMessage = '❌ Error: ' + (err.error?.message || 'Failed to send')
      });
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
