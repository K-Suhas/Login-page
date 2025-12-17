import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, DepartmentDTO } from '../Service/DepartmentService';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department.html',
  styleUrls: ['./department.css']
})
export class DepartmentComponent implements OnInit {
  searchQuery = '';
  message = '';

  filteredDepartments: DepartmentDTO[] = [];
  addForm: { name: string } = { name: '' };
  updateForm: { name: string } = { name: '' };
  updateId = '';

  showAddForm = false;
  showUpdateForm = false;

  currentPage = 0;
  totalPages = 1;

  constructor(private deptService: DepartmentService) {}

  ngOnInit(): void {
    this.getAllDepartments();
  }

  getAllDepartments(): void {
    this.deptService.getAllDepartments().subscribe({
      next: (data) => {
        this.filteredDepartments = data;
        this.totalPages = 1; // adjust if backend supports pagination
        this.message = '';
      },
      error: (err) => {
        this.filteredDepartments = [];
        this.message = err.error?.message || 'Failed to load departments';
      }
    });
  }

  searchDepartments(): void {
    if (!this.searchQuery.trim()) {
      this.message = 'Please enter a search term.';
      return;
    }
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredDepartments = this.filteredDepartments.filter(
      d => d.name.toLowerCase() === q || d.id.toString() === q
    );
    this.message = this.filteredDepartments.length ? '' : 'No departments found.';
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.addForm = { name: '' };
    this.message = '';
  }

  submitAdd(): void {
    if (!this.addForm.name.trim()) {
      this.message = 'Department name required';
      return;
    }
    this.deptService.addDepartment(this.addForm).subscribe({
      next: (msg) => {
        this.message = msg;
        this.showAddForm = false;
        this.getAllDepartments();
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to add department';
      }
    });
  }

  prepareUpdate(dept: DepartmentDTO): void {
    this.updateId = String(dept.id);
    this.updateForm = { name: dept.name };
    this.showUpdateForm = true;
    this.message = '';
  }

  toggleUpdateForm(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.updateId = '';
    this.updateForm = { name: '' };
    this.message = '';
  }

  submitUpdate(): void {
    if (!this.updateId) {
      this.message = 'No department selected for update.';
      return;
    }
    const payload: DepartmentDTO = { id: Number(this.updateId), name: this.updateForm.name };
    this.deptService.updateDepartment(payload).subscribe({
      next: (msg) => {
        this.message = msg;
        this.showUpdateForm = false;
        this.getAllDepartments();
      },
      error: (err) => {
        this.message = err.error?.message || 'Update failed';
      }
    });
  }

  deleteDepartment(id: number): void {
    if (!confirm(`Are you sure you want to delete department ID ${id}?`)) return;
    this.deptService.deleteDepartment(id).subscribe({
      next: () => {
        this.message = 'Department deleted successfully';
        this.getAllDepartments();
      },
      error: (err) => {
        this.message = err.error?.message || 'Failed to delete department';
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getAllDepartments();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.getAllDepartments();
    }
  }
}
