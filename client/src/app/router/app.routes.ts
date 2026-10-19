import { Routes } from '@angular/router';
import { HomeComponent } from '../Views/Home/Home.Component';
import { LoginComponent } from '../Views/Auth/Login.Component';
import { RegisterComponent } from '../Views/Auth/Register.Component';
import { PlansComponent } from '../Views/Plans/Plans.Component';
import { AdminLayoutComponent } from '../Layouts/admin-layout.component';
import { authGuard, employeeOnlyGuard, enterpriseOnlyGuard } from '../Guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'plans', component: PlansComponent },
  {
    path: 'employee-dashboard',
    redirectTo: 'app/employee-dashboard',
    pathMatch: 'full'
  },
  {
    path: 'app',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        canActivate: [enterpriseOnlyGuard],
        loadComponent: () => import('../Views/Dashboard/Dashboard.Component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'employee-dashboard', 
        canActivate: [employeeOnlyGuard],
        loadComponent: () => import('../Views/Dashboard/EmployeeDashboard.Component').then(m => m.EmployeeDashboardComponent) 
      },
      { 
        path: 'enterprises', 
        loadComponent: () => import('../Views/Enterprises/enterprises.component').then(m => m.EnterprisesComponent) 
      },
      { 
        path: 'employees', 
        canActivate: [enterpriseOnlyGuard],
        loadComponent: () => import('../Views/Employees/employees.component').then(m => m.EmployeesComponent) 
      },
      { 
        path: 'inventory', 
        loadComponent: () => import('../Views/Inventory/inventory.component').then(m => m.InventoryComponent) 
      },
      { 
        path: 'reports', 
        canActivate: [enterpriseOnlyGuard],
        loadComponent: () => import('../Views/Reports/reports.component').then(m => m.ReportsComponent) 
      },
      { 
        path: 'analytics', 
        redirectTo: 'reports', 
        pathMatch: 'full' 
      }
    ]
  },
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    canActivate: [authGuard, enterpriseOnlyGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('../Views/Dashboard/Dashboard.Component').then(m => m.DashboardComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
