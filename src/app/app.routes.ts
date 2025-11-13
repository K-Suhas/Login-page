import { Routes } from '@angular/router';
import { StudentComponent } from './student/student'; // updated import
import { App } from './app';
import { HomeComponent } from './home/home';
import { CourseComponent } from './course/course';
import { MarksheetComponent } from './marksheet/marksheet';
import { PercentageGraphComponent } from './percentage-graph/percentage-graph';
import { adminGuard } from './guards/admin-guard';
export const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: App },
  { path: 'home', component: HomeComponent },
  { path: 'students', component: StudentComponent },
  { path: 'course', component: CourseComponent },
  { path: 'marksheet', component: MarksheetComponent },
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
}

  
];