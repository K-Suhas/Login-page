import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, StudentDTO } from '../Service/StudentService';

@Component({
  selector: 'app-student',
  standalone: true,
  templateUrl: './student.html',
  styleUrls: ['./student.css'],
  imports: [CommonModule, FormsModule]
})
export class StudentComponent implements OnInit {
  students: StudentDTO[] = [];
  message = '';
  searchId = '';
  showTable = false;

  showAddForm = false;
  showUpdateForm = false;

  addForm: Partial<StudentDTO> = { name: '', dob: '', dept: '' };
  updateForm: Partial<StudentDTO> = { name: '', dob: '', dept: '' };
  updateId = '';
  deleteId = '';

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
   
  }

  getAllStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (data: StudentDTO[]) => {
        this.students = data || [];
        this.showTable = true; 
        this.message = this.students.length ? 'Students fetched' : 'No students found';
      },
      error: (err: any) => {
        this.message = 'Error fetching students: ' + (err?.message || err);
        this.showTable = false; // Hide table on error
      }
    });
  }

  getStudentById(): void {
    const idNum = Number(this.searchId);
    if (!idNum) { this.message = 'Enter a valid ID'; return; }
    this.studentService.getStudentById(idNum).subscribe({
      next: (data: StudentDTO) => { this.students = data ? [data] : []; this.message = 'Student fetched'; },
      error: (err: any) => this.message = 'Error fetching student: ' + (err?.message || err)
    });
  }

  toggleAddForm(): void { this.showAddForm = !this.showAddForm; if (this.showAddForm) { this.showUpdateForm = false; this.resetAddForm(); } }
  toggleUpdateForm(): void { this.showUpdateForm = !this.showUpdateForm; if (this.showUpdateForm) { this.showAddForm = false; this.resetUpdateForm(); } }

  submitAdd(): void {
    if (!this.addForm.name || !this.addForm.dob || !this.addForm.dept) { this.message = 'Provide name, dob, dept'; return; }
    this.studentService.createStudent(this.addForm).subscribe({
      next: (resp: string) => { this.message = resp || 'Created'; this.getAllStudents(); this.resetAddForm(); this.showAddForm = false; },
      error: (err: any) => this.message = 'Error adding: ' + (err?.message || err)
    });
  }

  submitUpdate(): void {
  const idNum = Number((this.updateId || '').toString().trim());
  if (!idNum) {
    this.message = 'Please enter a valid student ID';
    return;
  }

  const payload: Partial<StudentDTO> = {};
  if (this.updateForm.name) payload.name = this.updateForm.name;
  if (this.updateForm.dob) payload.dob = this.updateForm.dob;
  if (this.updateForm.dept) payload.dept = this.updateForm.dept;

  if (Object.keys(payload).length === 0) {
    this.message = 'Please provide at least one field to update';
    return;
  }

  console.log('PUT ->', `/student/${idNum}`, payload);
  this.studentService.updateStudent(idNum, payload).subscribe({
    next: (resp: string) => {
      this.message = resp || 'Student updated successfully';
      this.getAllStudents();
      this.resetUpdateForm();
      this.showUpdateForm = false;
    },
    error: (err: any) => {
      console.error('Update error', err);
      this.message = 'Error updating student: ' + (err?.message || err);
    }
  });
}

  deleteById(): void {
    const idNum = Number(this.deleteId);
    if (!idNum) { this.message = 'Enter ID to delete'; return; }
    this.studentService.deleteStudent(idNum).subscribe({
      next: (resp: string) => { this.message = resp || 'Deleted'; this.getAllStudents(); this.deleteId = ''; },
      error: (err: any) => this.message = 'Error deleting: ' + (err?.message || err)
    });
  }

  deleteStudent(id?: number): void {
    const idNum = Number(id);
    if (!idNum) { this.message = 'Invalid id'; return; }
    this.studentService.deleteStudent(idNum).subscribe({
      next: (resp: string) => { this.message = resp || 'Deleted'; this.getAllStudents(); },
      error: (err: any) => this.message = 'Error deleting: ' + (err?.message || err)
    });
  }

  resetAddForm(): void { this.addForm = { name: '', dob: '', dept: '' }; }
  resetUpdateForm(): void { this.updateForm = { name: '', dob: '', dept: '' }; this.updateId = ''; }
}