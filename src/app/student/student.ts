// src/app/student/StudentComponent.ts
import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDTO } from '../Service/StudentService';
import { CourseDTO, CourseService } from '../Service/CourseService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';
import { AuthService } from '../Service/AuthService';
import { DepartmentService } from '../Service/DepartmentService';
import { TeacherService } from '../Service/TeacherService';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class StudentComponent implements OnInit {
  // State
  searchQuery = '';
  searchId = '';
  deleteId = '';
  updateId = '';

  message = '';
  showAddForm = false;
  showUpdateForm = false;
  showTable = false;

  filteredStudents: StudentDTO[] = [];
  departments: { id: number; name: string }[] = [];

  // Forms
  addForm: StudentDTO = { name: '', dob: '', departmentName: '', courseNames: [], email: '' };
  updateForm: StudentDTO = { name: '', dob: '', departmentName: '', courseNames: [], email: '' };

  // Course selections
  availableCourses: string[] = [];
  selectedCourse = '';
  selectedUpdateCourse = '';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  // Bulk upload
  studentsToUpload: any[] = [];

  constructor(
    private studentService: StudentService,
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private teacherService: TeacherService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    // Load departments
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => { this.departments = data; },
      error: (err) => this.setMessage(err.error?.message || err.message || 'Failed to load departments')
    });

    const role = this.auth.getRole();

    // Bootstrap teacher department if missing, then load teacher courses
    if (role === 'TEACHER' && !this.auth.getDepartmentId()) {
      const email = this.auth.getEmail();
      if (email) {
        this.teacherService.getTeacherByEmail(email).subscribe({
          next: (t) => {
            this.auth.setDepartment(t.departmentId ?? null, t.departmentName ?? null);
            this.loadTeacherCourses();
            this.getAllStudents();
          },
          error: (err) => {
            this.setMessage(err.error?.message || err.message || 'Failed to resolve teacher department');
            this.getAllStudents();
          }
        });
        return;
      }
    }

    if (role === 'TEACHER') {
      this.loadTeacherCourses();
    } else {
      // Admin: defer courses until department is selected; start empty
      this.availableCourses = [];
    }

    this.getAllStudents();
  }

  // Role checks
  canEditStudents(): boolean {
    const role = this.auth.getRole();
    return role !== null && ['ADMIN', 'TEACHER'].includes(role);
  }

  // Load courses for teacher’s department
  private loadTeacherCourses(): void {
    const deptId = this.auth.getDepartmentId();
    if (deptId != null) {
      this.courseService.getCoursesByDepartment(deptId).subscribe({
        next: (list) => { this.availableCourses = (list ?? []).map((c: CourseDTO) => c.name); },
        error: (err) => this.setMessage(err.error?.message || err.message || 'Failed to load courses')
      });
    } else {
      this.availableCourses = [];
    }
  }

  // Admin: load courses for selected department name
  loadCoursesForDepartment(deptName: string | undefined): void {
    if (!deptName) {
      this.availableCourses = [];
      return;
    }
    const dept = this.departments.find(d => d.name === deptName);
    if (!dept) {
      this.availableCourses = [];
      return;
    }
    this.courseService.getCoursesByDepartment(dept.id).subscribe({
      next: (data) => { this.availableCourses = data.map((c: CourseDTO) => c.name); },
      error: (err) => {
        this.setMessage(err.error?.message || err.message || 'Failed to load courses for department');
        this.availableCourses = [];
      }
    });
  }

  // Change handlers for department dropdowns (admin)
  onDepartmentChange(deptName: string | undefined): void {
    this.selectedCourse = '';
    this.loadCoursesForDepartment(deptName);
  }

  onUpdateDepartmentChange(deptName: string | undefined): void {
    this.selectedUpdateCourse = '';
    this.loadCoursesForDepartment(deptName);
  }

  // Data fetch
  getAllStudents(): void {
  const role = this.auth.getRole();
  const deptId = this.auth.getDepartmentId();
  const email = this.auth.getEmail();

  if (role === 'ADMIN') {
    this.studentService.getAllStudents(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage('');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load students';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else if (role === 'TEACHER' && deptId != null) {
    this.studentService.getStudentsByDepartment(deptId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage('');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load students';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else if (role === 'STUDENT' && email) {
    this.studentService.getRestrictedStudents(email).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage('');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Failed to load students';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else {
    this.filteredStudents = [];
    this.showTable = false;
    this.setMessage('Not authorized to view students.');
  }
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

  // Search
  searchStudents(): void {
  if (!this.searchQuery.trim()) {
    this.setMessage('Please enter a search term.');
    this.filteredStudents = [];
    this.showTable = false;
    return;
  }

  const role = this.auth.getRole();
  const deptId = this.auth.getDepartmentId();
  const email = this.auth.getEmail();
  const q = this.searchQuery.trim().toLowerCase();

  if (role === 'ADMIN') {
    this.studentService.searchStudents(this.searchQuery.trim(), this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = data.content ?? [];
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage(this.filteredStudents.length ? '' : 'No students found.');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Search failed';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else if (role === 'TEACHER' && deptId != null) {
    this.studentService.getStudentsByDepartment(deptId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.filteredStudents = (data.content ?? []).filter(s =>
          s.name?.toLowerCase() === q ||
          s.email?.toLowerCase() === q ||
          s.id?.toString() === this.searchQuery
        );
        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage(this.filteredStudents.length ? '' : 'No students found.');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Search failed';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else if (role === 'STUDENT' && email) {
    this.studentService.getRestrictedStudents(email).subscribe({
      next: (data) => {
        this.filteredStudents = (data.content ?? []).filter((s: StudentDTO) =>
        s.name?.toLowerCase() === q ||
        s.email?.toLowerCase() === q ||
        s.id?.toString() === this.searchQuery
        );

        this.totalPages = data.totalPages ?? 1;
        this.showTable = true;
        this.setMessage(this.filteredStudents.length ? '' : 'No students found.');
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Search failed';
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  } else {
    this.setMessage('Not authorized to search students.');
    this.filteredStudents = [];
    this.showTable = false;
  }
}


  // Single student lookup
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
        this.setMessage(msg);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
  }

  // Delete
  deleteStudent(id: number | undefined): void {
    if (!id) { this.setMessage('Invalid student ID'); return; }
    if (!confirm(`Are you sure you want to delete student ID ${id}?`)) return;
    this.studentService.deleteStudent(id).subscribe({
      next: () => { this.setMessage('Student deleted successfully'); this.getAllStudents(); },
      error: (err) => this.setMessage(err.error?.message || err.message || 'Failed to delete student')
    });
  }

  // Add
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.setMessage('');
    this.addForm = { name: '', dob: '', departmentName: '', courseNames: [], email: '' };
    this.selectedCourse = '';
    if (this.auth.getRole() === 'TEACHER') {
      this.loadTeacherCourses();
    } else {
      this.availableCourses = [];
    }
  }
  submitBulkStudents(): void {
  if (!this.studentsToUpload.length) {
    this.setMessage('No students to upload');
    return;
  }

  if (this.auth.getRole() !== 'ADMIN') {
    this.setMessage('Bulk upload allowed only for ADMIN role');
    return;
  }

  const validStudents = this.studentsToUpload.filter(s =>
  s.name && s.dob && s.departmentName && s.email && Array.isArray(s.courseNames) && s.courseNames.length
);


  if (validStudents.length !== this.studentsToUpload.length) {
    this.setMessage('One or more rows are invalid. Upload aborted.');
    return;
  }

  this.studentService.uploadBulkStudents(validStudents).subscribe({
    next: (res) => {
      const msg = res?.message || 'Students uploaded successfully';
      this.setMessage(msg);
    },
    error: (err) => {
      if (Array.isArray(err.error)) {
        this.setMessage('Errors:\n' + err.error.join('\n'));
      } else {
        const msg = err.error?.message || err.message || 'Upload failed';
        this.setMessage(msg);
      }
    }
  });
}

showBulkForm = false;

toggleBulkForm(): void {
  this.showBulkForm = !this.showBulkForm;
  this.setMessage('');
  this.studentsToUpload = [];
}


  submitAdd(): void {
    if (!this.addForm.name?.trim() || !this.selectedCourse?.trim() || !this.addForm.email?.trim()) {
      this.setMessage('Name, course, and email are required');
      return;
    }
    this.addForm.courseNames = [this.selectedCourse];

    const role = this.auth.getRole();
    const deptId = this.auth.getDepartmentId();

    if (role === 'ADMIN') {
      const dept = this.departments.find(d => d.name === this.addForm.departmentName);
      if (!dept) { this.setMessage('Please select a department'); return; }
      this.addForm.departmentId = dept.id;

      this.studentService.addStudent(this.addForm).subscribe({
        next: (msg) => { this.setMessage(msg); this.toggleAddForm(); this.getAllStudents(); },
        error: (err) => this.setMessage(err.error?.message || err.message || 'Failed to add student')
      });
    } else if (role === 'TEACHER' && deptId != null) {
      this.addForm.departmentId = deptId;
      this.addForm.departmentName = this.auth.getDepartmentName() ?? '';
      this.studentService.addStudentToDepartment(deptId, this.addForm).subscribe({
        next: (msg) => { this.setMessage(msg); this.toggleAddForm(); this.getAllStudents(); },
        error: (err) => this.setMessage(err.error?.message || err.message || 'Failed to add student')
      });
    }
  }

  // Update
  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.setMessage('');
    this.updateForm = { name: '', dob: '', departmentName: '', courseNames: [], email: '' };
    this.selectedUpdateCourse = '';
    this.updateId = '';
    if (this.auth.getRole() === 'TEACHER') {
      this.loadTeacherCourses();
    } else {
      this.availableCourses = [];
    }
  }

  prepareUpdate(student: StudentDTO): void {
    if (!student.id) { return; }
    this.updateId = String(student.id);
    this.updateForm = {
      name: student.name,
      dob: student.dob,
      departmentName: student.departmentName,
      courseNames: student.courseNames ?? [],
      email: student.email ?? ''
    };

    const role = this.auth.getRole();
    if (role === 'ADMIN') {
      this.loadCoursesForDepartment(this.updateForm.departmentName);
    } else if (role === 'TEACHER') {
      this.loadTeacherCourses();
    }

    this.selectedUpdateCourse = student.courseNames?.[0] ?? '';
    this.showUpdateForm = true;
    this.setMessage('');
  }

  submitUpdate(): void {
    if (!this.updateId) {
      this.setMessage('No student selected for update.');
      return;
    }

    const role = this.auth.getRole();
    const deptId = this.auth.getDepartmentId();

    if (role === 'ADMIN') {
      const dept = this.departments.find(d => d.name === this.updateForm.departmentName);
      if (dept) this.updateForm.departmentId = dept.id;
    } else if (role === 'TEACHER' && deptId != null) {
      this.updateForm.departmentId = deptId;
      this.updateForm.departmentName = this.auth.getDepartmentName() ?? '';
    }

    this.updateForm.courseNames = this.selectedUpdateCourse ? [this.selectedUpdateCourse] : [];

    const payload: StudentDTO = { ...this.updateForm, id: Number(this.updateId) };

    this.studentService.updateStudent(payload.id!, payload).subscribe({
      next: (msg) => { this.setMessage(msg); this.showUpdateForm = false; this.getAllStudents(); },
      error: (err) => this.setMessage(err.error?.message || err.message || 'Update failed')
    });
  }

  // CSV bulk upload
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
      // 🔽 Add the mapping here
      this.studentsToUpload = result.data.map((row: any) => {
        return {
          name: row['Name']?.trim(),
          dob: this.convertToIso(row['DOB']),
          departmentName: row['Department']?.trim(),
          courseNames: row['Course']?.split(',').map((c: string) => c.trim()).filter(Boolean),
          email: row['Email']?.trim()
        };
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

  // Messaging
  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.toLowerCase().includes('error') && msg !== 'No students found.') {
      setTimeout(() => { this.message = ''; }, 3000);
    }
  }
}
