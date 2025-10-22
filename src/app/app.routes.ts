import { Routes } from '@angular/router';
import { StudentComponent } from './student/student'; // updated import
import { App } from './app';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: App },
  { path: 'students', component: StudentComponent }
];