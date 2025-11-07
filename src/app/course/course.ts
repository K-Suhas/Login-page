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
  searchQuery = '';
  searchId = '';
  deleteId = '';
  updateId = '';
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;

  courses: CourseDTO[] = [];
  filteredCourses: CourseDTO[] = [];

  showAddForm = false;
  showUpdateForm = false;

  addForm: CourseDTO = { name: '' };
  updateForm: CourseDTO = { name: '' };

  message = '';

  constructor(private courseService: CourseService, private auth: AuthService) {}

  getAllCourses() {
    this.courseService.getAllCourses(this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.setMessage(`${data.totalElements} course(s) found.`);
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to load courses';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  canEditStudents(): boolean {
    const role = this.auth.getRole();
    return role !== null && ['ADMIN', 'TEACHER'].includes(role);
  }

  canManageCourses(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN';
  }

  searchCourses() {
    this.courseService.searchCourses(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.setMessage(`${data.totalElements} course(s) matched.`);
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to search courses';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  getCourseById() {
    if (!this.searchId.trim()) {
      this.setMessage('Please enter a Course ID.');
      return;
    }

    this.courseService.getCourseById(+this.searchId).subscribe({
      next: data => {
        this.filteredCourses = [data];
        this.totalPages = 1;
        this.setMessage('Course found.');
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Course not found';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  deleteById() {
    if (!this.deleteId.trim()) {
      this.setMessage('Please enter a Course ID to delete.');
      return;
    }

    this.courseService.deleteCourse(+this.deleteId).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.getAllCourses();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to delete course';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  deleteCourse(id: number | undefined) {
    if (id === undefined) {
      this.setMessage('Invalid course ID.');
      return;
    }

    this.courseService.deleteCourse(id).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.getAllCourses();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to delete course';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: '' };
    this.setMessage('');
  }

  toggleUpdateForm() {
    this.showUpdateForm = !this.showUpdateForm;
    this.updateForm = { name: '' };
    this.updateId = '';
    this.setMessage('');
  }

  prepareUpdate(course: CourseDTO): void {
    this.updateId = String(course.id);
    this.updateForm = { name: course.name };
    this.showUpdateForm = true;
    this.setMessage('');
  }

  submitAdd() {
    if (!this.addForm.name.trim()) {
      this.setMessage('Course name is required.');
      return;
    }

    this.courseService.addCourse(this.addForm).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.toggleAddForm();
        this.getAllCourses();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to add course';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  submitUpdate() {
    if (!this.updateId.trim()) {
      this.setMessage('Course ID is required for update.');
      return;
    }

    this.courseService.updateCourse(+this.updateId, this.updateForm).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.toggleUpdateForm();
        this.getAllCourses();
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to update course';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

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

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error')) {
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }
}
