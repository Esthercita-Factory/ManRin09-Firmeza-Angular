import { Routes } from '@angular/router';
import { HomeComponent } from './Views/Home/Home.Component';
import { LoginComponent } from './Views/Auth/Login.Component';
import { RegisterComponent } from './Views/Auth/Register.Component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
