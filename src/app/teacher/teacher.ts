// src/app/teacher/TeacherComponent.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, TeacherDTO } from '../Service/TeacherService';
import { AuthService } from '../Service/AuthService';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css']
})
export class TeacherComponent implements OnInit {
  teachers: TeacherDTO[] = [];
  departments: { id: number, name: string }[] = [];

  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | null = null;
  message = '';

  searchQuery = '';
  showTable = false;

  showAddForm = false;
  showUpdateForm = false;
  updateId = '';

  currentPage = 0;
  totalPages = 0;
  pageSize = 5;

  addForm: TeacherDTO = { name: '', email: '', departmentId: undefined, departmentName: '' };
  updateForm: TeacherDTO = { name: '', email: '', departmentId: undefined, departmentName: '' };

  constructor(private teacherService: TeacherService, private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.getAllTeachers();
    this.teacherService.getAllDepartments().subscribe({
      next: data => this.departments = data,
      error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to load departments')
    });
  }

  getAllTeachers(): void {
    if (this.role === 'ADMIN') {
      this.teacherService.getAllTeachers(this.currentPage, this.pageSize).subscribe({
        next: data => {
          this.teachers = data.content ?? [];
          this.totalPages = data.totalPages ?? 1;
          this.showTable = true;
        },
        error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to load teachers')
      });
    } else if (this.role === 'TEACHER') {
      const deptId = this.auth.getDepartmentId();
      if (deptId) {
        this.teacherService.getTeachersByDepartment(deptId).subscribe({
          next: data => { this.teachers = data; this.showTable = true; this.totalPages = 1; },
          error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to load teachers')
        });
      }
    }
  }

  searchTeachers(): void {
    if (!this.searchQuery.trim()) {
      this.setMessage('Please enter a search term.');
      this.teachers = [];
      this.showTable = false;
      return;
    }

    this.teacherService.searchTeachers(this.searchQuery.trim(), this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.teachers = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage(this.teachers.length ? '' : 'No teachers found.');
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Search failed';
        this.setMessage(msg);
        this.teachers = [];
        this.showTable = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getAllTeachers();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.getAllTeachers();
    }
  }

  isAdmin(): boolean { return this.role === 'ADMIN'; }

  toggleAddForm(): void {
    if (!this.isAdmin()) return;
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: '', email: '', departmentId: undefined, departmentName: '' };
  }

  toggleUpdateForm(): void {
    if (!this.isAdmin()) return;
    this.showUpdateForm = !this.showUpdateForm;
    this.updateForm = { name: '', email: '', departmentId: undefined, departmentName: '' };
    this.updateId = '';
  }

  prepareUpdate(t: TeacherDTO): void {
    if (!this.isAdmin()) return;
    if (!t.id) { this.setMessage('Teacher ID missing'); return; }
    this.updateId = String(t.id);
    this.updateForm = { name: t.name, email: t.email, departmentId: t.departmentId, departmentName: t.departmentName };
    this.showUpdateForm = true;
  }

  submitAdd(): void {
    if (!this.isAdmin()) return;
    if (!this.addForm.name?.trim() || !this.addForm.email?.trim() || !this.addForm.departmentId) {
      this.setMessage('Name, email, and department are required');
      return;
    }
    this.teacherService.addTeacher(this.addForm).subscribe({
      next: () => { this.setMessage('Teacher added successfully'); this.toggleAddForm(); this.getAllTeachers(); },
      error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to add teacher')
    });
  }

  submitUpdate(): void {
    if (!this.isAdmin()) return;
    const id = Number(this.updateId);
    if (!id || !this.updateForm.name?.trim() || !this.updateForm.email?.trim() || !this.updateForm.departmentId) {
      this.setMessage('All fields are required for update');
      return;
    }
    this.teacherService.updateTeacher(id, this.updateForm).subscribe({
      next: () => { this.setMessage('Teacher updated successfully'); this.toggleUpdateForm(); this.getAllTeachers(); },
      error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to update teacher')
    });
  }

  deleteTeacher(id: number | undefined): void {
    if (!this.isAdmin()) return;
    if (id === undefined) { this.setMessage('Invalid teacher ID'); return; }
    if (!confirm(`Are you sure you want to delete teacher ID ${id}?`)) return;
    this.teacherService.deleteTeacher(id).subscribe({
      next: () => { this.setMessage('Teacher deleted successfully'); this.getAllTeachers(); },
      error: err => this.setMessage(err?.error?.message || err?.message || 'Failed to delete teacher')
    });
  }

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error') && msg !== 'No students found.') {
      setTimeout(() => { this.message = ''; }, 3000);
    }
  }
}
