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

  addForm: CourseDTO = { name: ''};
  updateForm: CourseDTO = { name: '' };

  message = '';

  constructor(private courseService: CourseService) {}

  getAllCourses() {
    this.courseService.getAllCourses(this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.courses = data.content;
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.message = `${data.totalElements} course(s) found.`;
      },
      error: () => this.message = 'Error fetching courses.'
    });
  }

  searchCourses() {
    this.courseService.searchCourses(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.filteredCourses = data.content;
        this.totalPages = data.totalPages;
        this.message = `${data.totalElements} course(s) matched.`;
      },
      error: () => this.message = 'Search failed.'
    });
  }

  getCourseById() {
    if (!this.searchId.trim()) {
      this.message = 'Please enter a Course ID.';
      return;
    }

    this.courseService.getCourseById(+this.searchId).subscribe({
      next: data => {
        this.filteredCourses = [data];
        this.totalPages = 1;
        this.message = 'Course found.';
      },
      error: () => this.message = 'Course not found.'
    });
  }

  deleteById() {
    if (!this.deleteId.trim()) {
      this.message = 'Please enter a Course ID to delete.';
      return;
    }

    this.courseService.deleteCourse(+this.deleteId).subscribe({
      next: msg => {
        this.message = msg;
        this.getAllCourses();
      },
      error: () => this.message = 'Deletion failed.'
    });
  }

deleteCourse(id: number | undefined) {
  if (id === undefined) {
    this.message = 'Invalid course ID.';
    return;
  }

  this.courseService.deleteCourse(id).subscribe({
    next: msg => {
      this.message = msg;
      this.getAllCourses();
    },
    error: () => this.message = 'Deletion failed.'
  });
}


  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: ''};
  }

  toggleUpdateForm() {
    this.showUpdateForm = !this.showUpdateForm;
    this.updateForm = { name: ''};
    this.updateId = '';
  }

  submitAdd() {
    if (!this.addForm.name.trim()) {
      this.message = 'Course name is required.';
      return;
    }

    this.courseService.addCourse(this.addForm).subscribe({
      next: msg => {
        this.message = msg;
        this.toggleAddForm();
        this.getAllCourses();
      },
      error: () => this.message = 'Failed to add course.'
    });
  }

  submitUpdate() {
    if (!this.updateId.trim()) {
      this.message = 'Course ID is required for update.';
      return;
    }

    this.courseService.updateCourse(+this.updateId, this.updateForm).subscribe({
      next: msg => {
        this.message = msg;
        this.toggleUpdateForm();
        this.getAllCourses();
      },
      error: () => this.message = 'Update failed.'
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
}
