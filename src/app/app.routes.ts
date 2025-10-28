import { Routes } from '@angular/router';
import { StudentComponent } from './student/student'; // updated import
import { App } from './app';
import { HomeComponent } from './home/home';
import { CourseComponent } from './course/course';
export const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: App },
  { path: 'home', component: HomeComponent },
  { path: 'students', component: StudentComponent },
  { path: 'course', component: CourseComponent }
];