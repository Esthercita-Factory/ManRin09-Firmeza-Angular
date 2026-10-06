import { Routes } from '@angular/router';
import { HomeComponent } from './Views/Home/Home.Component';
import { LoginComponent } from './Views/Auth/Login.Component';
import { RegisterComponent } from './Views/Auth/Register.Component';
import { PlansComponent } from './Views/Plans/Plans.Component';
import { AdminLayoutComponent } from './Layouts/admin-layout.component';
import { authGuard } from './Guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'plans', component: PlansComponent },
  {
    path: 'app',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./Views/Dashboard/Dashboard.Component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'clients', 
        loadComponent: () => import('./Views/Clients/clients.component').then(m => m.ClientsComponent) 
      },
      { 
        path: 'enterprises', 
        loadComponent: () => import('./Views/Enterprises/enterprises.component').then(m => m.EnterprisesComponent) 
      }
    ]
  },
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./Views/Dashboard/Dashboard.Component').then(m => m.DashboardComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
