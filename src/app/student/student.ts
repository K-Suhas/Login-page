import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDTO } from '../Service/StudentService';
import { CourseDTO, CourseService } from '../Service/CourseService';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}
