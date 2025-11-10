import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarksheetService, MarksDTO, MarksEntryRequest, MarksResponseDTO, StudentMarksSummaryDTO } from '../Service/MarksheetService';
import { AuthService } from '../Service/AuthService';

@Component({
  selector: 'app-marksheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './marksheet.html',
  styleUrls: ['./marksheet.css']
})
export class MarksheetComponent implements OnInit {
  marksForm!: FormGroup;
  subjects = ['DBMS', 'DATA STRUCTURES', 'DAA', 'ADE', 'MES'];
  message = '';
  summary: MarksResponseDTO | null = null;

  searchStudentId: number | null = null;
  searchSemester: number = 1;
  page = 0;
  size = 5;
  showStudentSummary = false;


  constructor(
    private fb: FormBuilder,
    private service: MarksheetService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    console.log('User role:', this.auth.getRole());
  console.log('Can edit marks:', this.canEditMarks());
    this.marksForm = this.fb.group({
      studentId: [null, Validators.required],
      semester: [1, Validators.required],
      subjects: this.fb.array(
        this.subjects.map(subject =>
          this.fb.group({
            subjectName: [subject],
            marksObtained: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
          })
        )
      )
    });
   
  }
  toggleStudentSummary(): void {
  this.showStudentSummary = !this.showStudentSummary;
  if (this.showStudentSummary) {
    this.loadStudentSummary();
  }
}


  get subjectsArray(): FormArray {
    return this.marksForm.get('subjects') as FormArray;
  }

  submitMarks(): void {
    const payload: MarksEntryRequest = this.marksForm.value;
    this.service.submitMarks(payload).subscribe({
      next: () => this.setMessage('Marks saved successfully'),
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to save marks';
        this.setMessage(msg);
      }
    });
  }

  searchMarksheet(): void {
    if (!this.searchStudentId) {
      this.setMessage('Please enter a valid Student ID');
      return;
    }

    this.service.getMarksheetSummary(this.searchStudentId, this.searchSemester, this.page, this.size).subscribe({
      next: res => this.summary = res,
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to load marksheet';
        this.setMessage(msg);
        this.summary = null;
      }
    });
  }

  nextPage(): void {
    if (this.summary && this.page < this.summary.totalPages - 1) {
      this.page++;
      this.searchMarksheet();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.searchMarksheet();
    }
  }
  studentSummaryPage: StudentMarksSummaryDTO[] = [];
summaryPage = 0;
summaryTotalPages = 0;

loadStudentSummary(): void {
  this.service.getPaginatedStudentSummary(this.summaryPage, 5).subscribe({
    next: res => {
      this.studentSummaryPage = res.content;
      this.summaryTotalPages = res.totalPages;
    },
    error: err => {
      const msg = err.error?.message || err.error || 'Failed to load student summary';
      this.setMessage(msg);
    }
  });
}

nextSummaryPage(): void {
  if (this.summaryPage + 1 < this.summaryTotalPages) {
    this.summaryPage++;
    this.loadStudentSummary();
  }
}

prevSummaryPage(): void {
  if (this.summaryPage > 0) {
    this.summaryPage--;
    this.loadStudentSummary();
  }
}


  updateSubjectMarks(subjectName: string): void {
    const newMarks = prompt(`Enter new marks for ${subjectName}:`);
    const parsed = Number(newMarks);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      this.setMessage('Invalid marks');
      return;
    }

    this.service.updateMarks(this.searchStudentId!, this.searchSemester, subjectName, parsed).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.searchMarksheet();
      },
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to update marks';
        this.setMessage(msg);
      }
    });
  }

  deleteAllMarks(): void {
    if (!this.searchStudentId) {
      this.setMessage('Please enter a valid Student ID to delete marks');
      return;
    }

    if (!confirm(`Are you sure you want to delete all marks for Student ID ${this.searchStudentId}?`)) return;

    this.service.deleteAllMarks(this.searchStudentId, this.searchSemester).subscribe({
      next: msg => {
        this.setMessage(msg);
        this.summary = null;
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Failed to delete marks';
        this.setMessage(msg);
      }
    });
  }

  canEditMarks(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'TEACHER';
  }
  

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.includes('Failed')) {
      setTimeout(() => this.message = '', 3000);
    }
  }
 

  
}
