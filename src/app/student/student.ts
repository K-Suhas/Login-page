import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDTO } from '../Service/StudentService';
import { CourseDTO, CourseService } from '../Service/CourseService';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';
import { HttpClient } from '@angular/common/http';

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

  addForm: StudentDTO = { name: '', dob: '', dept: '', courseNames: [] };
  updateForm: StudentDTO = { name: '', dob: '', dept: '', courseNames: [] };
  filteredStudents: StudentDTO[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  availableCourses: string[] = [];

  constructor(
    private studentService: StudentService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseService.getAllCourses(0, 100).subscribe({
      next: (data) => {
        this.availableCourses = data.content.map((c: CourseDTO) => c.name);
      },
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
      }
    });
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
        console.error('Error:', err.message);
        this.setMessage(err.message);
        this.filteredStudents = [];
        this.showTable = false;
      }
    });
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
        console.error('Error:', err.message);
        this.setMessage(err.message);
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
        console.error('Error:', err.message);
        this.setMessage(err.message);
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

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.setMessage('Student deleted successfully');
        this.getAllStudents();
      },
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
      }
    });
  }

  deleteStudent(id: number | undefined): void {
    if (id === undefined) {
      this.setMessage('Invalid student ID');
      return;
    }

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.setMessage('Student deleted successfully');
        this.getAllStudents();
      },
      error: (err) => {
        console.error('Error:', err.message);
        this.setMessage(err.message);
      }
    });
  }
  studentsToUpload: any[] = [];

handleFileUpload(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      this.studentsToUpload = result.data.map((row: any, index: number) => {
        const name = row['Name']?.trim();
        const dob = this.convertToIso(row['DOB']);
        const dept = row['Department']?.trim();
        const courseNames = row['Course']?.split(',').map((c: string) => c.trim()).filter(Boolean);

        return { name, dob, dept, courseNames };
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

  const loggedInUser = localStorage.getItem('user');
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  this.addForm = {
  name: '',
  dob: '',
  dept: '',
  courseNames: []
};
 

  this.selectedCourse = '';
}



 toggleUpdateForm(): void {
  this.showUpdateForm = !this.showUpdateForm;
  this.setMessage('');
  this.updateForm = {
    name: '',
    dob: '',
    dept: '',
    courseNames: []
  };
  this.selectedUpdateCourse = '';
  this.updateId = '';
}

submitAdd(): void {
  if (
    !this.addForm.name?.trim() ||
    !this.selectedCourse?.trim()
  ) {
    this.setMessage('Name and course are required');
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
      console.error('Add error:', err.message);
      this.setMessage(err.message);
    }
  });
}


  submitUpdate(): void {
  const id = Number(this.updateId);
  if (
    !id ||
    !this.updateForm.name?.trim() ||
    !this.updateForm.dob ||
    !this.updateForm.dept?.trim() ||
    !this.selectedUpdateCourse?.trim()
  ) {
    this.setMessage('All fields are required for update');
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
      console.error('Update error:', err.message);
      this.setMessage(err.message);
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

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.includes('Error') && msg !== 'No students found.') {
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }
 submitBulkStudents(): void {
  if (!this.studentsToUpload.length) {
    this.setMessage('No students to upload');
    return;
  }

  const validStudents = this.studentsToUpload.filter(s =>
    s.name && s.dob && s.dept && Array.isArray(s.courseNames) && s.courseNames.length
  );

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

    // Defensive fallback if success lands in error block
    if (err?.error?.text === 'Students uploaded successfully') {
      this.setMessage('Students uploaded successfully');
      this.getAllStudents();
      return;
    }

    if (Array.isArray(err.error)) {
      this.setMessage('Errors:\n' + err.error.join('\n'));
    } else {
      this.setMessage(err.message || 'Upload failed');
    }
  }
});

}


}
