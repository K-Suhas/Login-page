// src/app/marksheet/marksheet.component.ts
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarksheetService, MarksEntryRequest, MarksResponseDTO, StudentMarksSummaryDTO, MarksDTO } from '../Service/MarksheetService';
import { AuthService } from '../Service/AuthService';
import { StudentReportService, StudentMarksheetDTO } from '../Service/StudentReportService';
import { SubjectService, SubjectDTO } from '../Service/SubjectService';

@Component({
  selector: 'app-marksheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './marksheet.html',
  styleUrls: ['./marksheet.css']
})
export class MarksheetComponent implements OnInit {
  marksForm!: FormGroup;
  subjectForm!: FormGroup;
  viewSubjectsForm!: FormGroup;

  showSubjectForm = false;
  showViewSubjectsForm = false;
  showMarksForm = false;

  subjectsList: SubjectDTO[] = [];
  summary: MarksResponseDTO | null = null;
  studentSummaryPage: StudentMarksSummaryDTO[] = [];
  individualReport?: StudentMarksheetDTO;

  searchStudentId: number | null = null;
  searchSemester: number = 1;
  page = 0;
  size = 5;
  showStudentSummary = false;
  summaryPage = 0;
  summaryTotalPages = 0;

  message = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private service: MarksheetService,
    public auth: AuthService,
    private reportService: StudentReportService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.marksForm = this.fb.group({
      studentId: [null, Validators.required],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
      subjects: this.fb.array([])
    });

    this.subjectForm = this.fb.group({
      departmentId: [null, Validators.required],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.viewSubjectsForm = this.fb.group({
      departmentId: [null, Validators.required],
      semester: [1, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  get subjectsArray(): FormArray {
    return this.marksForm.get('subjects') as FormArray;
  }

  private buildSubjectRow(subject: { id: number; name: string }): FormGroup {
    return this.fb.group({
      subjectId: [subject.id],
      subjectName: [subject.name],
      marksObtained: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  // Toggles
  toggleSubjectForm(): void { this.showSubjectForm = !this.showSubjectForm; }
  toggleViewSubjectsForm(): void { this.showViewSubjectsForm = !this.showViewSubjectsForm; if (!this.showViewSubjectsForm) this.subjectsList = []; }
  toggleMarksForm(): void { this.showMarksForm = !this.showMarksForm; if (!this.showMarksForm) this.subjectsArray.clear(); }

  canEditMarks(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'TEACHER';
  }

  setMessage(msg: string, isError: boolean = false): void {
    this.message = msg;
    this.isError = isError;
    if (!isError && msg) {
      setTimeout(() => (this.message = ''), 4000);
    }
  }

  // Subject management
  createSubject(): void {
    if (this.auth.getRole() !== 'ADMIN') {
      this.setMessage('Only admin can create subjects', true);
      return;
    }
    if (this.subjectForm.invalid) {
      this.setMessage('Enter department, semester, and subject name', true);
      return;
    }
    const dto: SubjectDTO = this.subjectForm.value;
    this.subjectService.createSubject(dto).subscribe({
      next: msg => this.setMessage(msg || 'Subject created'),
      error: err => this.setMessage(err.error?.message || err.error || 'Failed to create subject', true)
    });
  }

  viewSubjects(): void {
    const { departmentId, semester } = this.viewSubjectsForm.value;
    this.subjectService.getByDepartmentAndSemester(departmentId, semester).subscribe({
      next: list => {
        this.subjectsList = list;
        if (!list.length) {
          this.setMessage(`No subjects configured for this department in semester ${semester}`, true);
        } else {
          this.setMessage('Subjects loaded successfully');
        }
      },
      error: err => this.setMessage(err.error?.message || err.error || 'Failed to load subjects', true)
    });
  }

  updateSubject(subject: SubjectDTO): void {
    if (!subject.id) {
      this.setMessage('Subject ID missing', true);
      return;
    }
    this.subjectService.updateSubject(subject.id, subject).subscribe({
      next: msg => this.setMessage(msg || 'Subject updated successfully'),
      error: err => this.setMessage(err.error?.message || err.error || 'Failed to update subject', true)
    });
  }

  deleteSubject(id: number): void {
    this.subjectService.deleteSubject(id).subscribe({
      next: msg => {
        this.setMessage(msg || 'Subject deleted successfully');
        this.subjectsList = this.subjectsList.filter(s => s.id !== id);
      },
      error: err => this.setMessage(err.error?.message || err.error || 'Failed to delete subject', true)
    });
  }

  // Marks workflow
  loadMarksTable(): void {
    const studentId = this.marksForm.get('studentId')?.value;
    const semester = this.marksForm.get('semester')?.value;
    if (!studentId || !semester) { this.setMessage('Enter student ID and semester', true); return; }

    this.service.getSubjectsForStudent(studentId, semester).subscribe({
      next: list => {
        const fa = this.fb.array(list.map(s => this.buildSubjectRow({ id: s.id, name: s.name })));
        this.marksForm.setControl('subjects', fa);
        if (!list.length) {
          this.setMessage(`No subjects configured for this department in semester ${semester}`, true);
        } else {
          this.setMessage('Subjects loaded for marks entry');
        }
      },
      error: err => {
        const msg = err.error?.message || 'Failed to load subjects';
        this.setMessage(msg, true);
        this.subjectsArray.clear();
      }
    });
  }

  submitMarks(): void {
    if (!this.canEditMarks()) { this.setMessage('Not authorized', true); return; }
    if (this.marksForm.invalid || this.subjectsArray.length === 0) {
      this.setMessage('Enter student, semester, and marks', true); return;
    }

    const payload: MarksEntryRequest = {
      studentId: this.marksForm.get('studentId')?.value,
      semester: this.marksForm.get('semester')?.value,
      subjects: (this.subjectsArray.value as MarksDTO[]).map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        marksObtained: s.marksObtained
      }))
    };

    this.service.submitMarks(payload).subscribe({
      next: () => this.setMessage('Marks saved successfully'),
      error: err => {
        if (err.status === 409) {
          this.setMessage('Marks already entered for this student in this semester', true);
        } else {
          const msg = err.error?.message || 'Failed to save marks';
          this.setMessage(msg, true);
        }
      }
    });
  }

  updateSubjectMarks(subjectId: number | null, subjectName: string): void {
    if (!subjectId) { this.setMessage('Subject ID missing', true); return; }
    const newMarksStr = prompt(`Enter new marks for ${subjectName}:`);
    const parsed = Number(newMarksStr);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) { this.setMessage('Invalid marks', true); return; }
    if (!this.searchStudentId) { this.setMessage('Search a student first', true); return; }

    this.service.updateMarks(this.searchStudentId, this.searchSemester, subjectId, parsed).subscribe({
      next: msg => { this.setMessage(msg || 'Marks updated'); this.searchMarksheet(); },
      error: err => this.setMessage(err.error?.message || 'Failed to update marks', true)
    });
  }

  deleteAllMarks(): void {
    if (!this.canEditMarks()) {
      this.setMessage('Not authorized to delete marks', true);
      return;
    }
    if (!this.searchStudentId) {
      this.setMessage('Enter a valid Student ID to delete marks', true);
      return;
    }
    if (!confirm(`Delete all marks for Student ID ${this.searchStudentId}?`)) return;

    this.service.deleteAllMarks(this.searchStudentId, this.searchSemester).subscribe({
      next: msg => {
        this.setMessage(msg || 'Marks deleted');
        this.summary = null;
      },
      error: err => this.setMessage(err.error?.message || err.message || 'Failed to delete marks', true)
    });
  }

  searchMarksheet(): void {
  const role = this.auth.getRole();
  const user = this.auth.getUser();

  // For students: if they didn’t type anything, default to their own ID
  if (role === 'STUDENT' && !this.searchStudentId) {
    this.searchStudentId = user?.id;
  }

  if (!this.searchStudentId) {
    this.setMessage('Enter a valid Student ID', true);
    return;
  }

  this.service.getMarksheetSummary(this.searchStudentId, this.searchSemester, this.page, this.size).subscribe({
    next: res => {
      this.summary = res;
      this.setMessage('Marksheet loaded');
    },
    error: err => {
      if (err.status === 404) {
        this.setMessage('No marks found for this student in this semester', true);
      } else {
        const msg = err.error?.message || err.error || 'Failed to load marksheet';
        this.setMessage(msg, true);
      }
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

  toggleStudentSummary(): void {
    this.showStudentSummary = !this.showStudentSummary;
    if (this.showStudentSummary) this.loadStudentSummary();
  }

  loadStudentSummary(): void {
  const role = this.auth.getRole();

  this.service.getPaginatedStudentSummary(this.summaryPage, 5).subscribe({
    next: res => {
      this.studentSummaryPage = res.content;
      this.summaryTotalPages = res.totalPages;
      this.setMessage(role === 'STUDENT' ? 'Department summary loaded' : 'Student summary loaded');
    },
    error: err => this.setMessage(err.error?.message || 'Failed to load summary', true)
  });
}





  prevSummaryPage(): void {
    if (this.summaryPage > 0) {
      this.summaryPage--;
      this.loadStudentSummary();
    }
  }

  nextSummaryPage(): void {
    if (this.summaryPage + 1 < this.summaryTotalPages) {
      this.summaryPage++;
      this.loadStudentSummary();
    }
  }

  loadIndividualReport(): void {
  const role = this.auth.getRole();
  if (role === 'STUDENT') {
    this.setMessage('Only ADMIN or TEACHER can view individual reports', true);
    return;
  }
  if (!this.searchStudentId) {
    this.setMessage('Enter a valid Student ID', true);
    return;
  }

  // Toggle: if report is already loaded, hide it
  if (this.individualReport) {
    this.individualReport = undefined;
    return;
  }

  // Otherwise fetch and show
  this.reportService.getIndividualReport(this.searchStudentId, this.searchSemester).subscribe({
    next: data => { 
      this.individualReport = data; 
      this.setMessage('Individual report loaded'); 
    },
    error: err => {
      this.setMessage(err.error?.message || err.error || 'Failed to load individual report', true);
      this.individualReport = undefined;
    }
  });
}


  downloadIndividualCsv(): void {
    const role = this.auth.getRole();
    if (role === 'STUDENT') {
      this.setMessage('Only ADMIN or TEACHER can download individual reports', true);
      return;
    }
    if (!this.searchStudentId) {
      this.setMessage('Enter a valid Student ID', true);
      return;
    }
    this.reportService.downloadIndividualReport(this.searchStudentId, this.searchSemester).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_${this.searchStudentId}_report.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.setMessage('Report downloaded');
      },
      error: err => this.setMessage(err.error?.message || err.error || 'Failed to download report', true)
    });
  }
}
