import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../Service/AdminService';
import { Router } from '@angular/router';
import { PercentageGraphComponent } from '../percentage-graph/percentage-graph'; // ✅ Confirm this path is correct

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,PercentageGraphComponent
],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  students: any[] = [];
  courses: any[] = [];
  loading = true;

  studentPage = 0;
  coursePage = 0;
  pageSize = 5 ;

  constructor(private adminService: AdminService, private router: Router) {}

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

    window.onpopstate = () => {
      history.pushState(null, '', '/admin-dashboard');
    };
  }

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
  get maxStudentPages(): number {
  return Math.min(5, Math.ceil(this.students.length / this.pageSize));
}

get maxCoursePages(): number {
  return Math.min(5, Math.ceil(this.courses.length / this.pageSize));
}


nextStudentPage() {
  if (this.studentPage + 1 < this.maxStudentPages) {
    this.studentPage++;
  }
}

nextCoursePage() {
  if (this.coursePage + 1 < this.maxCoursePages) {
    this.coursePage++;
  }
}


  prevCoursePage() {
    if (this.coursePage > 0) this.coursePage--;
  }


  goToHome(): void {
    this.router.navigate(['/home']);
  }
}
