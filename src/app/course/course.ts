// src/app/Component/CourseComponent.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseDTO } from '../Service/CourseService';
import { RouterModule } from '@angular/router';

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

  constructor(private courseService: CourseService) {}

  getAllCourses() {
    this.courseService.getAllCourses(this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.setMessage(`${data.totalElements} course(s) found.`);
      },
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
      }
    });
  }

  searchCourses() {
    this.courseService.searchCourses(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.setMessage(`${data.totalElements} course(s) matched.`);
      },
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
