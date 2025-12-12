import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarksheetService, MarksEntryRequest, MarksResponseDTO, StudentMarksSummaryDTO } from '../Service/MarksheetService';
import { AuthService } from '../Service/AuthService';
import { StudentReportService, StudentMarksheetDTO } from '../Service/StudentReportService';

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
  studentSummaryPage: StudentMarksSummaryDTO[] = [];
  summaryPage = 0;
  summaryTotalPages = 0;

  individualReport?: StudentMarksheetDTO;

  constructor(
    private fb: FormBuilder,
    private service: MarksheetService,
    public auth: AuthService,
    private reportService: StudentReportService
  ) {}

  ngOnInit(): void {
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

    // ✅ If student logs in, auto-fill their ID
    if (this.auth.getRole() === 'STUDENT') {
      const user = this.auth.getUser();
      if (user?.id) {
        this.marksForm.patchValue({ studentId: user.id });
      }
    }
  }

  get subjectsArray(): FormArray {
    return this.marksForm.get('subjects') as FormArray;
  }

  // ✅ Only Admin + Teacher can enter/update/delete marks
  canEditMarks(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'TEACHER';
  }

  // ✅ Submit marks (Admin + Teacher only)
  submitMarks(): void {
    if (!this.canEditMarks()) {
      this.setMessage('Not authorized to submit marks.');
      return;
    }

    const payload: MarksEntryRequest = this.marksForm.value;

    this.service.submitMarks(payload).subscribe({
      next: () => this.setMessage('Marks saved successfully'),
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to save marks';
        this.setMessage(msg);
      }
    });
  }

  // ✅ Search marksheet (Student can only search themselves)
  searchMarksheet(): void {
    const role = this.auth.getRole();
    const user = this.auth.getUser();

    if (role === 'STUDENT') {
      if (!user?.id) {
        this.setMessage('Unable to determine your student ID');
        return;
      }
      this.searchStudentId = user.id;
    }

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

  // ✅ Toggle summary of all students
  toggleStudentSummary(): void {
    this.showStudentSummary = !this.showStudentSummary;
    if (this.showStudentSummary) {
      this.loadStudentSummary();
    }
  }

  // ✅ Admin + Teacher can view summary; Student cannot
  loadStudentSummary(): void {
    const role = this.auth.getRole();

    if (role === 'STUDENT') {
      this.setMessage('Students cannot view all students summary.');
      this.showStudentSummary = false;
      return;
    }

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

  // ✅ Update marks (Admin + Teacher only)
  updateSubjectMarks(subjectName: string): void {
    if (!this.canEditMarks()) {
      this.setMessage('Not authorized to update marks.');
      return;
    }

    const newMarks = prompt(`Enter new marks for ${subjectName}:`);
    const parsed = Number(newMarks);

    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      this.setMessage('Invalid marks');
      return;
    }

    if (!this.searchStudentId) {
      this.setMessage('Please search a student first.');
      return;
    }

    this.service.updateMarks(this.searchStudentId, this.searchSemester, subjectName, parsed).subscribe({
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

  // ✅ Delete all marks (Admin + Teacher only)
  deleteAllMarks(): void {
    if (!this.canEditMarks()) {
      this.setMessage('Not authorized to delete marks.');
      return;
    }

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

  // ✅ Admin-only individual report
  loadIndividualReport(): void {
    if (this.auth.getRole() !== 'ADMIN') {
      this.setMessage('Only ADMIN can view individual reports');
      return;
    }

    if (!this.searchStudentId) {
      this.setMessage('Please enter a valid Student ID');
      return;
    }

    this.reportService.getIndividualReport(this.searchStudentId, this.searchSemester).subscribe({
      next: data => this.individualReport = data,
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to load individual report';
        this.setMessage(msg);
        this.individualReport = undefined;
      }
    });
  }

  downloadIndividualCsv(): void {
    if (this.auth.getRole() !== 'ADMIN') {
      this.setMessage('Only ADMIN can download individual reports');
      return;
    }

    if (!this.searchStudentId) {
      this.setMessage('Please enter a valid Student ID');
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
      },
      error: err => {
        const msg = err.error?.message || err.error || 'Failed to download report';
        this.setMessage(msg);
      }
    });
  }

  private setMessage(msg: string): void {
    this.message = msg;
    if (msg && !msg.includes('Failed')) {
      setTimeout(() => this.message = '', 3000);
    }
  }
}
