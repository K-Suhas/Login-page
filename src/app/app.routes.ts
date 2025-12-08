import { Routes } from '@angular/router';
import { AppComponent } from './app';
import { adminGuard } from './guards/admin-guard';
import { TeacherComponent } from './teacher/teacher';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AppComponent },

  {
    path: 'home',
    loadComponent: () =>
      import('./home/home').then(m => m.HomeComponent)
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./student/student').then(m => m.StudentComponent)
  },
  {
    path: 'course',
    loadComponent: () =>
      import('./course/course').then(m => m.CourseComponent)
  },
  {
    path: 'marksheet',
    loadComponent: () =>
      import('./marksheet/marksheet').then(m => m.MarksheetComponent)
  },
  {
    path: 'percentage-graph',
    loadComponent: () =>
      import('./percentage-graph/percentage-graph').then(m => m.PercentageGraphComponent)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./teacher/teacher').then(m => m.TeacherComponent)
  }
];
