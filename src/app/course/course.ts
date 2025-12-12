// src/app/course/CourseComponent.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseDTO } from '../Service/CourseService';
import { RouterModule } from '@angular/router';
import { AuthService } from '../Service/AuthService';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course.html',
  styleUrls: ['./course.css']
})
export class CourseComponent {
  // Search and control fields
  searchQuery = '';
  searchId = '';
  deleteId = '';
  updateId = '';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;

  // Data and forms
  filteredCourses: CourseDTO[] = [];
  showAddForm = false;
  showUpdateForm = false;
  addForm: CourseDTO = { name: '', departmentId: undefined, departmentName: '' };
  updateForm: CourseDTO = { name: '', departmentId: undefined, departmentName: '' };

  // Departments dropdown
  departments: { id: number, name: string }[] = [];

  // Feedback
  message = '';

  constructor(private courseService: CourseService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  // Load departments for dropdowns
  private loadDepartments(): void {
    this.courseService.getAllDepartments().subscribe({
      next: data => this.departments = data,
      error: () => this.setMessage('Failed to load departments')
    });
  }

  // Role-based permissions
  canManageCourses(): boolean {
    return this.auth.getRole() === 'ADMIN';
  }

  // Get all courses (admin: paginated from backend, teacher: list by department)
  getAllCourses() {
  const role = this.auth.getRole();
  const deptId = this.auth.getDepartmentId();
  const email = this.auth.getEmail();

  if (role === 'ADMIN') {
    this.courseService.getAllCourses(this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.setMessage(`${data.totalElements ?? this.filteredCourses.length} course(s) found.`);
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to load courses')
    });
  } else if (role === 'TEACHER' && deptId != null) {
    this.courseService.getCoursesByDepartment(deptId).subscribe({
      next: list => {
        this.filteredCourses = list ?? [];
        this.totalPages = Math.ceil(this.filteredCourses.length / this.pageSize) || 1;
        this.currentPage = 0;
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to load courses')
    });
  } else if (role === 'STUDENT' && email) {
    this.courseService.getRestrictedCourses(email).subscribe({
      next: list => {
        this.filteredCourses = list ?? [];
        this.totalPages = Math.ceil(this.filteredCourses.length / this.pageSize) || 1;
        this.currentPage = 0;
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to load courses')
    });
  } else {
    this.filteredCourses = [];
    this.totalPages = 0;
    this.setMessage('Not authorized to view courses.');
  }
}


  // Search courses by query (admin: global, teacher: restricted to department)
  searchCourses() {
  const role = this.auth.getRole();
  const deptId = this.auth.getDepartmentId();
  const email = this.auth.getEmail();

  if (!this.searchQuery.trim()) {
    this.setMessage('Please enter a search term.');
    return;
  }

  if (role === 'ADMIN') {
    this.courseService.searchCourses(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.setMessage(`${data.totalElements ?? this.filteredCourses.length} course(s) matched.`);
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to search courses')
    });
  } else if (role === 'TEACHER' && deptId != null) {
    this.courseService.searchCoursesByDepartment(this.searchQuery, deptId, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.setMessage(`${data.totalElements ?? this.filteredCourses.length} course(s) matched.`);
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to search courses')
    });
  } else if (role === 'STUDENT' && email) {
    this.courseService.getRestrictedCourses(email).subscribe({
      next: list => {
        this.filteredCourses = (list ?? []).filter(c =>
          c.name?.toLowerCase().includes(this.searchQuery.trim().toLowerCase())
        );
        this.totalPages = Math.ceil(this.filteredCourses.length / this.pageSize) || 1;
        this.currentPage = 0;
        this.setMessage(`${this.filteredCourses.length} course(s) matched.`);
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to search courses')
    });
  } else {
    this.setMessage('Not authorized to search courses.');
  }
}


  // Exact ID lookup
  getCourseById() {
    if (!this.searchId.trim()) {
      this.setMessage('Please enter a Course ID.');
      return;
    }

    this.courseService.getCourseById(+this.searchId).subscribe({
      next: data => {
        this.filteredCourses = [data];
        this.totalPages = 1;
        this.currentPage = 0;
        this.setMessage('Course found.');
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Course not found')
    });
  }

  // Delete by explicit id field
  deleteById() {
    if (!this.canManageCourses()) {
      this.setMessage('Only ADMIN can delete courses.');
      return;
    }
    if (!this.deleteId.trim()) {
      this.setMessage('Please enter a Course ID to delete.');
      return;
    }

    this.courseService.deleteCourse(+this.deleteId).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.getAllCourses();
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to delete course')
    });
  }

  // Delete from table row
  deleteCourse(id: number | undefined) {
    if (!this.canManageCourses()) {
      this.setMessage('Only ADMIN can delete courses.');
      return;
    }
    if (id === undefined) {
      this.setMessage('Invalid course ID.');
      return;
    }
    this.courseService.deleteCourse(id).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.getAllCourses();
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to delete course')
    });
  }

  // Toggle add form
  toggleAddForm() {
    if (!this.canManageCourses()) return;
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: '', departmentId: undefined, departmentName: '' };
    this.message = '';
  }

  // Toggle update form
  toggleUpdateForm() {
    if (!this.canManageCourses()) return;
    this.showUpdateForm = !this.showUpdateForm;
    this.updateForm = { name: '', departmentId: undefined, departmentName: '' };
    this.updateId = '';
    this.message = '';
  }

  // Prepare update payload
  prepareUpdate(course: CourseDTO): void {
    if (!this.canManageCourses()) return;
    if (!course.id) {
      this.setMessage('Invalid course selection for update.');
      return;
    }
    this.updateId = String(course.id);
    // Lock department in UI (backend ignores any department change on update anyway)
    this.updateForm = {
      name: course.name,
      departmentName: course.departmentName,
      departmentId: course.departmentId
    };
    this.showUpdateForm = true;
    this.message = '';
  }

  // Submit create
  submitAdd() {
    if (!this.canManageCourses()) {
      this.setMessage('Only ADMIN can add courses.');
      return;
    }
    if (!this.addForm.departmentId) {
      this.setMessage('Department must be selected.');
      return;
    }
    if (!this.addForm.name || !this.addForm.name.trim()) {
      this.setMessage('Course name is required.');
      return;
    }

    this.courseService.addCourse(this.addForm).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.toggleAddForm();
        this.getAllCourses();
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to add course')
    });
  }

  // Submit update (only name changes; department locked)
  submitUpdate() {
    if (!this.canManageCourses()) {
      this.setMessage('Only ADMIN can update courses.');
      return;
    }
    if (!this.updateId.trim()) {
      this.setMessage('Course ID is required for update.');
      return;
    }
    const payload: CourseDTO = { name: this.updateForm.name };

    this.courseService.updateCourse(+this.updateId, payload).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.toggleUpdateForm();
        this.getAllCourses();
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to update course')
    });
  }

  // Pagination handlers
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getAllCourses();
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.getAllCourses();
    }
  }

  // Feedback messaging
  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error')) {
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }
}
