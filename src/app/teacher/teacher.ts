// src/app/teacher/teacher.ts
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
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | null = null;
  message = '';

  searchQuery = '';
  showTable = false;

  showAddForm = false;
  showUpdateForm = false;
  updateId = '';

  addForm: TeacherDTO = { name: '', email: '', dept: '' };
  updateForm: TeacherDTO = { name: '', email: '', dept: '' };

  constructor(private teacherService: TeacherService, private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.getAllTeachers();
  }

  getAllTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data: TeacherDTO[]) => {
        this.teachers = data;
        this.showTable = true;
        this.setMessage('');
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.message || 'Failed to load teachers';
        this.setMessage(msg);
        this.teachers = [];
        this.showTable = false;
      }
    });
  }

  searchTeachers(): void {
    if (!this.searchQuery.trim()) {
      this.setMessage('Please enter a search term.');
      this.teachers = [];
      this.showTable = false;
      return;
    }

    this.teacherService.searchTeachers(this.searchQuery).subscribe({
      next: (data: any) => {
        this.teachers = data.content ?? [];
        this.showTable = true;
        this.setMessage(this.teachers.length ? '' : 'No teachers found.');
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.message || 'Search failed';
        this.setMessage(msg);
        this.teachers = [];
        this.showTable = false;
      }
    });
  }

  isAdmin(): boolean { return this.role === 'ADMIN'; }

  toggleAddForm(): void {
    if (!this.isAdmin()) return;
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: '', email: '', dept: '' };
    this.setMessage('');
  }

  toggleUpdateForm(): void {
    if (!this.isAdmin()) return;
    this.showUpdateForm = !this.showUpdateForm;
    this.updateForm = { name: '', email: '', dept: '' };
    this.updateId = '';
    this.setMessage('');
  }

  prepareUpdate(t: TeacherDTO): void {
    if (!this.isAdmin()) return;
    if (!t.id) { this.setMessage('Teacher ID missing'); return; }
    this.updateId = String(t.id);
    this.updateForm = { name: t.name, email: t.email, dept: t.dept };
    this.showUpdateForm = true;
  }

  submitAdd(): void {
    if (!this.isAdmin()) return;
    if (!this.addForm.name?.trim() || !this.addForm.email?.trim() || !this.addForm.dept?.trim()) {
      this.setMessage('Name, email, and department are required');
      return;
    }
    this.teacherService.addTeacher(this.addForm).subscribe({
      next: () => { this.setMessage('Teacher added successfully'); this.toggleAddForm(); this.getAllTeachers(); },
      error: (err: any) => { this.setMessage(err?.error?.message || err?.message || 'Failed to add teacher'); }
    });
  }

  submitUpdate(): void {
    if (!this.isAdmin()) return;
    const id = Number(this.updateId);
    if (!id || !this.updateForm.name?.trim() || !this.updateForm.email?.trim() || !this.updateForm.dept?.trim()) {
      this.setMessage('All fields are required for update');
      return;
    }
    this.teacherService.updateTeacher(id, this.updateForm).subscribe({
      next: () => { this.setMessage('Teacher updated successfully'); this.toggleUpdateForm(); this.getAllTeachers(); },
      error: (err: any) => { this.setMessage(err?.error?.message || err?.message || 'Failed to update teacher'); }
    });
  }

  deleteTeacher(id: number | undefined): void {
    if (!this.isAdmin()) return;
    if (id === undefined) { this.setMessage('Invalid teacher ID'); return; }
    if (!confirm(`Are you sure you want to delete teacher ID ${id}?`)) return;
    this.teacherService.deleteTeacher(id).subscribe({
      next: () => { this.setMessage('Teacher deleted successfully'); this.getAllTeachers(); },
      error: (err: any) => { this.setMessage(err?.error?.message || err?.message || 'Failed to delete teacher'); }
    });
  }

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error')) {
      setTimeout(() => { this.message = ''; }, 3000);
    }
  }
}
