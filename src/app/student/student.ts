import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDTO } from '../Service/StudentService';
import { CourseDTO, CourseService } from '../Service/CourseService';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';
import { AuthService } from '../Service/AuthService';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class StudentComponent implements OnInit {
  searchQuery = '';
  searchId = '';
  deleteId = '';
  updateId = '';
  selectedCourse = '';
  selectedUpdateCourse = '';
  message = '';
  showAddForm = false;
  showUpdateForm = false;
  showTable = false;

  addForm: StudentDTO = { name: '', dob: '', dept: '', courseNames: [],email: '' };
  updateForm: StudentDTO = { name: '', dob: '', dept: '', courseNames: [],email: '' };
  filteredStudents: StudentDTO[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  availableCourses: string[] = [];
  studentsToUpload: any[] = [];

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.courseService.getAllCourses(0, 100).subscribe({
      next: (data) => {
        this.availableCourses = data.content.map((c: CourseDTO) => c.name);
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load courses';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });

    this.getAllStudents();
  }

  getAllStudents(): void {
    this.studentService.getAllStudents(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages;
        this.showTable = true;
        this.setMessage('');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load students';
        console.error('Error:', msg);
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getAllStudents();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.getAllStudents();
    }
  }

  canEditStudents(): boolean {
    const role = this.auth.getRole();
    return role !== null && ['ADMIN', 'TEACHER'].includes(role);
  }

  canManageCourses(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN';
  }

  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.setMessage('Please enter a search term.');
      this.filteredStudents = [];
      this.showTable = false;
      return;
    }

    this.studentService.searchStudents(this.searchQuery.trim(), this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages;
        this.setMessage(data.content?.length ? '' : 'No students found.');
        this.showTable = true;
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Search failed';
        console.error('Error:', msg);
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  }

  getStudentById(): void {
    const id = Number(this.searchId);
    if (!id) {
      this.setMessage('Invalid ID');
      return;
    }

    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.filteredStudents = student ? [student] : [];
        this.totalPages = 1;
        this.setMessage(student ? '' : 'Student not found');
        this.showTable = false;
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to fetch student';
        console.error('Error:', msg);
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  }

  deleteById(): void {
    const id = Number(this.deleteId);
    if (!id) {
      this.setMessage('Invalid ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete student ID ${id}?`)) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.setMessage('Student deleted successfully');
        this.getAllStudents();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to delete student';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  deleteStudent(id: number | undefined): void {
    if (id === undefined) {
      this.setMessage('Invalid student ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete student ID ${id}?`)) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.setMessage('Student deleted successfully');
        this.getAllStudents();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to delete student';
        console.error('Error:', msg);
        this.setMessage(msg);
      }
    });
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      this.setMessage('Please upload a valid CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.studentsToUpload = result.data.map((row: any) => {
          const name = row['Name']?.trim();
          const dob = this.convertToIso(row['DOB']);
          const dept = row['Department']?.trim();
          const courseNames = row['Course']?.split(',').map((c: string) => c.trim()).filter(Boolean);
          const email = row['Email']?.trim();
          return { name, dob, dept, courseNames, email };

        });
      },
      error: (err) => {
        console.error('CSV parsing error:', err);
        this.setMessage('Failed to parse CSV file');
      }
    });
  }

  convertToIso(dob: string): string | null {
    if (!dob) return null;
    const [dd, mm, yyyy] = dob.split('-');
    if (!dd || !mm || !yyyy) return null;
    return `${yyyy}-${mm}-${dd}`;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.setMessage('');
    this.addForm = { name: '', dob: '', dept: '', courseNames: [] };
    this.selectedCourse = '';
  }

  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.setMessage('');
    this.updateForm = { name: '', dob: '', dept: '', courseNames: [] };
    this.selectedUpdateCourse = '';
    this.updateId = '';
  }

  prepareUpdate(student: StudentDTO): void {
    if (!student.id) {
      console.warn('Student ID missing in prepareUpdate');
      return;
    }

    this.updateId = String(student.id);
    this.updateForm = {
      name: student.name,
      dob: student.dob,
      dept: student.dept,
      courseNames: student.courseNames ?? [],
      email: student.email ?? ''
    };
    this.selectedUpdateCourse = student.courseNames?.[0] ?? '';
    this.showUpdateForm = true;
    this.setMessage('');
  }

  submitAdd(): void {
    if (!this.addForm.name?.trim() || !this.selectedCourse?.trim() || !this.addForm.email?.trim()) {
      this.setMessage('Name, course, and email are required');
       return;
      }


    this.addForm.courseNames = [this.selectedCourse];

    this.studentService.addStudent(this.addForm).subscribe({
      next: () => {
        this.setMessage('Student added successfully');
        this.toggleAddForm();
        this.getAllStudents();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to add student';
        console.error('Add error:', msg);
        this.setMessage(msg);
      }
    });
  }

    submitUpdate(): void {
    const id = Number(this.updateId);
    if (!id || !this.updateForm.name?.trim() || !this.updateForm.dob || !this.updateForm.dept?.trim() || !this.selectedUpdateCourse?.trim() || !this.updateForm.email?.trim()) {
      this.setMessage('All fields including email are required for update');
       return;
    }


    this.updateForm.courseNames = [this.selectedUpdateCourse];

    this.studentService.updateStudent(id, this.updateForm).subscribe({
      next: () => {
        this.setMessage('Student updated successfully');
        this.toggleUpdateForm();
        this.getAllStudents();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to update student';
        console.error('Update error:', msg);
        this.setMessage(msg);
      }
    });
  }

  submitBulkStudents(): void {
    if (!this.studentsToUpload.length) {
      this.setMessage('No students to upload');
      return;
    }

    const validStudents = this.studentsToUpload.filter(s =>
    s.name && s.dob && s.dept && s.email && Array.isArray(s.courseNames) && s.courseNames.length);


    if (!validStudents.length) {
      this.setMessage('All rows are missing required fields');
      return;
    }

    this.studentService.uploadBulkStudents(validStudents).subscribe({
      next: (res) => {
        const msg = res?.message || res?.text || 'Students uploaded successfully';
        this.setMessage(msg);
        this.getAllStudents();
      },
      error: (err) => {
        console.error('Bulk upload error:', err);

        if (err?.error?.text === 'Students uploaded successfully') {
          this.setMessage('Students uploaded successfully');
          this.getAllStudents();
          return;
        }
        if (Array.isArray(err.error)) {
          this.setMessage('Errors:\n' + err.error.join('\n'));
        } else {
          const msg = err.error?.message || err.message || 'Upload failed';
          this.setMessage(msg);
        }
      }
    });
  }

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error') && msg !== 'No students found.') {
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }
}
