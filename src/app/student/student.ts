import { Component, OnInit } from '@angular/core';
import { StudentService, StudentDTO } from '../Service/StudentService';
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
  message = '';
  showAddForm = false;
  showUpdateForm = false;

  addForm: StudentDTO = { name: '', dob: '', dept: '' };
  updateForm: StudentDTO = { name: '', dob: '', dept: '' };
  filteredStudents: StudentDTO[] = [];

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {}

  getAllStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.filteredStudents = students ?? [];
        this.setMessage('');
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.setMessage('Error fetching students');
        this.filteredStudents = [];
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
        if (student) {
          this.filteredStudents = [student];
          this.setMessage('');
        } else {
          this.setMessage('Student not found');
          this.filteredStudents = [];
        }
      },
      error: (err) => {
        console.error('Error fetching student:', err);
        this.setMessage('Student not found');
        this.filteredStudents = [];
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
        this.refreshStudents();
      },
      error: (err) => {
        console.error('Error deleting student:', err);
        this.setMessage('Error deleting student');
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
        this.refreshStudents();
      },
      error: (err) => {
        console.error('Error deleting student:', err);
        this.setMessage('Error deleting student');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.setMessage('');
    this.addForm = { name: '', dob: '', dept: '' };
  }

  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.setMessage('');
    this.updateForm = { name: '', dob: '', dept: '' };
  }

  submitAdd(): void {
    if (!this.addForm.name || !this.addForm.dob || !this.addForm.dept) {
      this.setMessage('All fields are required');
      return;
    }

    this.studentService.addStudent(this.addForm).subscribe({
      next: (res) => {
        console.log('Add success:', res);
        this.setMessage('Student added successfully');
        this.toggleAddForm();
        this.refreshStudents();
      },
      error: (err) => {
        console.error('Add error:', err);
        this.setMessage('Error adding student');
      }
    });
  }

  submitUpdate(): void {
    const id = Number(this.updateId);
    if (!id) {
      this.setMessage('Invalid ID');
      return;
    }

    this.studentService.updateStudent(id, this.updateForm).subscribe({
      next: (res) => {
        console.log('Update success:', res);
        this.setMessage('Student updated successfully');
        this.toggleUpdateForm();
        this.refreshStudents();
      },
      error: (err) => {
        console.error('Update error:', err);
        this.setMessage('Error updating student');
      }
    });
  }

    searchStudents(): void {
      if (!this.searchQuery.trim()) {
        this.setMessage('Please enter a search term.');
        this.filteredStudents = [];
        return;
      }

      this.studentService.searchStudents(this.searchQuery.trim()).subscribe({
        next: (students) => {
          this.filteredStudents = students ?? [];
          this.setMessage(students?.length ? '' : 'No students found.');
        },
        error: (err) => {
          console.error('Search error:', err);
          this.setMessage('Error searching students');
          this.filteredStudents = [];
        }
      });
    }

  private refreshStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.filteredStudents = students ?? [];
      },
      error: (err) => {
        console.error('Error refreshing student list:', err);
      }
    });
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
