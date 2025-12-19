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
import { DepartmentService, DepartmentDTO } from '../Service/DepartmentService';
import { SubjectChoiceService } from '../Service/SubjectChoiceService';

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
  departments: { id: number; name: string }[] = [];
  semesters: number[] = [1,2,3,4,5,6,7,8];
  fixedDepartmentName: string = '';

  showChooseSubjectsForm = false;
  chooseSemester: number | null = null;
  availableSubjectsForChoice: any[] = [];
  chosenSubjectIds: number[] = [];
  isChoiceLocked = false;


  message = '';
  isError = false;

  constructor(
    private fb: FormBuilder,
    private service: MarksheetService,
    public auth: AuthService,
    private reportService: StudentReportService,
    private subjectService: SubjectService,
    private departmentService: DepartmentService,
    private subjectChoiceService: SubjectChoiceService
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
    this.loadDepartments();
    const role = this.auth.getRole();
    const deptId = this.auth.getDepartmentId();
    const deptName = this.auth.getDepartmentName();

if (role === 'TEACHER' || role === 'STUDENT') {
  if (deptId !== null) {
    this.viewSubjectsForm.patchValue({ departmentId: Number(deptId) });
    this.fixedDepartmentName = deptName || '';
  } else {
    console.error('DepartmentId missing for user role:', role);
  }
}


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
  loadDepartments(): void {
  this.departmentService.getAllDepartments().subscribe({
  next: (data) => this.departments = data,
  error: (err) => this.setMessage(err.error?.message || 'Failed to load departments', true)
});

}

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

  this.subjectChoiceService.getStudentChoice(studentId, semester).subscribe({
    next: (choice: any) => {
      if (!choice || !choice.subjectIds || choice.subjectIds.length === 0) {
        this.setMessage('Student has not chosen subjects for this semester', true);
        this.subjectsArray.clear();
        return;
      }

      this.subjectService.getSubjectsByIds(choice.subjectIds).subscribe({
        next: (subjects: any[]) => {
          this.subjectsArray.clear();
          subjects.forEach(s => {
            this.subjectsArray.push(this.fb.group({
              subjectId: [s.id],
              subjectName: [s.name],
              marksObtained: [0]
            }));
          });
        },
        error: () => this.setMessage('Failed to load chosen subjects', true)
      });
    },
    error: (err) => {
      if (err.status === 404) {
        this.setMessage('Student has not chosen subjects for this semester', true);
      } else {
        this.setMessage('Failed to load subject choice', true);
      }
      this.subjectsArray.clear();
    }
  });
}






/** Helper to actually load subjects */
private loadSubjectsForMarks(studentId: number, semester: number): void {
  // ✅ Clear before loading
  this.subjectsArray.clear();

  this.service.getSubjectsForStudent(studentId, semester).subscribe({
    next: list => {
      if (list.length) {
        const fa = this.fb.array(list.map(s => this.buildSubjectRow({ id: s.id, name: s.name })));
        this.marksForm.setControl('subjects', fa);
        this.setMessage('Subjects loaded for marks entry', false);
      } else {
        this.setMessage('No subjects found', true);
        // ✅ Hide table if no subjects
        this.subjectsArray.clear();
      }
    },
    error: err => {
      this.setMessage(err.error?.message || 'Failed to load subjects', true);
      // ✅ Hide table on error
      this.subjectsArray.clear();
    }
  });
}




  submitMarks(): void {
  if (!this.canEditMarks()) { 
    this.setMessage('Not authorized', true); 
    return; 
  }
  if (this.marksForm.invalid || this.subjectsArray.length === 0) {
    this.setMessage('Enter student, semester, and marks', true); 
    return;
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
    next: () => {
      this.setMessage('Marks saved successfully', false);
      // ✅ Hide subjects table after successful submit
      this.subjectsArray.clear();
    },
    error: err => {
      if (err.status === 409) {
        this.setMessage('Marks already entered for this student in this semester', true);
      } else {
        const msg = err.error?.message || 'Failed to save marks';
        this.setMessage(msg, true);
      }
      // ✅ Hide subjects table on error
      this.subjectsArray.clear();
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

  // ✅ Hide the search form once search is triggered
  this.showSearchForm = false;

  // Reset summary before search
  this.summary = null;

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
      this.setMessage('Marksheet loaded', false);
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
showSidebar = false;
showSearchForm = false;

toggleSidebar(): void {
  this.showSidebar = !this.showSidebar;
  if (!this.showSidebar) {
    this.showSubjectForm = false;
    this.showViewSubjectsForm = false;
    this.showMarksForm = false;
    this.showSearchForm = false;
  }
}

toggleSearchForm(): void {
  this.showSearchForm = !this.showSearchForm;
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
clearSummary(): void {
  this.summary = null;
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

loadAvailableSubjectsForChoice(): void {
  const deptId = this.auth.getDepartmentId();
  const studentId = this.auth.getUser()?.id;

  // Guard against missing values
  if (!deptId || !studentId || !this.chooseSemester) {
    this.setMessage('Missing department, student, or semester', true);
    return;
  }

  // 1) Check if already chosen (locked)
  this.subjectChoiceService.getStudentChoice(studentId, this.chooseSemester).subscribe({
    next: (choice: any) => {
      if (choice && choice.locked) {
        this.isChoiceLocked = true;
        this.chosenSubjectIds = choice.subjectIds;
        this.setMessage('You have already chosen subjects for this semester', true);
      }
    },
    error: () => {
      // ignore if not found
    }
  });

  // 2) Load available subjects for dept+semester
  this.subjectService.getByDepartmentAndSemester(deptId, this.chooseSemester).subscribe({
    next: (list: any[]) => {
      if (!list || list.length === 0) {
        this.setMessage('No subjects added to this semester yet', true);
        this.availableSubjectsForChoice = [];
      } else {
        this.availableSubjectsForChoice = list;
      }
    },
    error: () => {
      this.setMessage('Failed to load subjects', true);
      this.availableSubjectsForChoice = [];
    }
  });
}
toggleChooseSubjectsForm(): void {
  this.showChooseSubjectsForm = !this.showChooseSubjectsForm;
  this.chosenSubjectIds = [];
  this.isChoiceLocked = false;
}

// --- Checkbox handler ---
onToggleSubjectChoice(event: Event, subjectId: number): void {
  const checked = (event.target as HTMLInputElement).checked;
  if (checked) {
    if (this.chosenSubjectIds.length >= 4) {
      (event.target as HTMLInputElement).checked = false;
      this.setMessage('You must choose exactly 4 subjects', true);
      return;
    }
    this.chosenSubjectIds.push(subjectId);
  } else {
    this.chosenSubjectIds = this.chosenSubjectIds.filter(id => id !== subjectId);
  }
}

// --- Validation helper ---
canSubmitChoices(): boolean {
  return this.chosenSubjectIds.length === 4 && !this.isChoiceLocked;
}

// --- Submit choices ---
submitSubjectChoices(): void {
  const studentId = this.auth.getUser()?.id;
  console.log("Submitting subject choices for student ID:", studentId);
  const deptId = this.auth.getDepartmentId();

  if (!studentId || !deptId || !this.chooseSemester) {
    this.setMessage('Missing student, department, or semester', true);
    return;
  }

  if (this.chosenSubjectIds.length !== 4) {
    this.setMessage('You must choose exactly 4 subjects', true);
    return;
  }
  console.log({
  studentId,
  departmentId: deptId,
  semester: this.chooseSemester,
  subjectIds: this.chosenSubjectIds
});


  this.subjectChoiceService.createStudentChoice({
    studentId,
    departmentId: deptId,
    semester: this.chooseSemester,
    subjectIds: this.chosenSubjectIds
  }).subscribe({
    next: () => {
      this.setMessage('Subjects chosen successfully', false);
      this.showChooseSubjectsForm = false;
    },
    error: (err) => {
      if (err.status === 400) {
        this.setMessage('Invalid subject choice — must be 4 valid subjects', true);
      } else {
        this.setMessage('Failed to save choices', true);
      }
    }
  });
}


}
