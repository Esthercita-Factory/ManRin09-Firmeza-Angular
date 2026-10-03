import { Routes } from '@angular/router';
import { HomeComponent } from '../Views/Home/Home.Component';
import { LoginComponent } from '../Views/Auth/Login.Component';
import { RegisterComponent } from '../Views/Auth/Register.Component';
import { PlansComponent } from '../Views/Plans/Plans.Component';
import { DashboardComponent } from '../Views/Dashboard/Dashboard.Component';
import { AuthGuard } from '../Guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'plans', component: PlansComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
