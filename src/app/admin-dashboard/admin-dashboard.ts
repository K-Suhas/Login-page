// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../Service/AdminService';
import { MailService } from '../Service/MailService';
import { Router } from '@angular/router';
import { PercentageGraphComponent } from '../percentage-graph/percentage-graph';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { StudentReportService } from '../Service/StudentReportService';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PercentageGraphComponent, NotificationBellComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  students: any[] = [];
  courses: any[] = [];
  loading = true;

  // Mail form fields
  toEmail: string = 'ALL';
  subject: string = '';
  body: string = '';
  mailMessage: string = '';
  newAdmin = { name: '', email: '' };
  adminMessage = '';
  showAddAdminForm = false;

  studentPage = 0;
  coursePage = 0;
  pageSize = 5;

  // Report progress state
  reportJobId: string | null = null;
  reportProgress = 0;
  reportState = '';
  reportMessage = '';
  pollingInterval: any;
  showSidebar = false;

toggleSidebar() {
  this.showSidebar = !this.showSidebar;
}



  constructor(
    private adminService: AdminService,
    private mailService: MailService,
    private reportService: StudentReportService,
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

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
  toggleAddAdminForm() {
    this.showAddAdminForm = !this.showAddAdminForm;
    this.adminMessage = '';
    if (!this.showAddAdminForm) {
      this.newAdmin = { name: '', email: ''};
    }
  }
  
  goToStudentInfo() { this.router.navigate(['/students']); }
  goToCourses() { this.router.navigate(['/course']); }
  goToMarksheet() { this.router.navigate(['/marksheet']); }
  goToTeacherManagement() { this.router.navigate(['/teacher']); }
  addAdmin() {
    if (!this.newAdmin.name.trim() || !this.newAdmin.email.trim()) {
      this.adminMessage = '❌ Name and email are required';
      return;
    }

    this.adminService.addAdmin(this.newAdmin).subscribe({
      next: () => {
        this.adminMessage = '✅ Admin added successfully';
        this.newAdmin = { name: '', email: '' };
      },
      error: err => {
        this.adminMessage = '❌ Error: ' + (err.error?.message || 'Failed to add admin');
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

  prevStudentPage() { if (this.studentPage > 0) this.studentPage--; }
  nextStudentPage() {
    if ((this.studentPage + 1) * this.pageSize < this.students.length) {
      this.studentPage++;
    }
  }

  prevCoursePage() { if (this.coursePage > 0) this.coursePage--; }
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

  // ===== Report generation flow =====
  generateReport() {
  this.reportJobId = 'pending'; // show bar immediately
  this.reportProgress = 0;
  this.reportState = 'PENDING';
  this.reportMessage = 'Starting report...';

  this.reportService.startReport().subscribe({
    next: jobId => {
      this.reportJobId = jobId; // replace with real jobId
      this.reportMessage = 'Report queued...';
      this.startPolling();
    },
    error: err => {
      console.error('Failed to start report:', err);
      this.reportMessage = '❌ Error starting report';
      this.reportJobId = null; // hide bar if failed
    }
  });
}


  startPolling() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      if (!this.reportJobId) return;
      this.reportService.getStatus(this.reportJobId).subscribe({
        next: status => {
          this.reportProgress = status.progress;
          this.reportState = status.state;
          this.reportMessage = status.message;

          if (status.state === 'READY') {
            clearInterval(this.pollingInterval);
            this.downloadCsv();
          }
          if (status.state === 'FAILED' || status.state === 'NOT_FOUND') {
            clearInterval(this.pollingInterval);
            this.reportMessage = status.message || 'Report failed';
          }
        },
        error: err => {
          console.error('Polling error:', err);
          clearInterval(this.pollingInterval);
          this.reportMessage = '❌ Error polling report status';
        }
      });
    }, 1000);
  }

  downloadCsv() {
    if (!this.reportJobId) return;
    this.reportService.downloadReport(this.reportJobId).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        this.reportMessage = '✅ Report downloaded';
      },
      error: err => {
        console.error('Download error:', err);
        this.reportMessage = '❌ Error downloading report';
      }
    });
  }
}
