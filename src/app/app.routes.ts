import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MarineSurveysComponent } from './pages/services/marine-surveys/marine-surveys.component';
import { LegalAssistanceComponent } from './pages/services/legal-assistance/legal-assistance.component';
import { GeneralAverageComponent } from './pages/services/general-average/general-average.component';
import { PollutionComponent } from './pages/services/pollution/pollution.component';
import { MedicalAssistanceComponent } from './pages/services/medical-assistance/medical-assistance.component';
import { CustomsFinesComponent } from './pages/services/customs-fines/customs-fines.component';
import { StowawayssComponent } from './pages/services/stowaways/stowaways.component';
import { ContactComponent } from './pages/contact/contact.component';
import {UsersComponent} from "./pages/user/users.component";
import {ClaimsComponent} from "./pages/claims/claims.component";
import {ContractsComponent} from "./pages/contracts/contracts.component";
import {QuotationsComponent} from "./pages/quotations/quotations.component";
import {ShellComponent} from "./pages/shell/shell.component";
import {DashboardHomeComponent} from "./pages/dashbordHome/dashboard-home.component";

// New dashboard layout components

export const routes: Routes = [
  // Authentication
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },

  // Dashboard Layout
  {
    path: 'dashboard',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
        title: 'Dashboard'
      },
      {
        path: 'users',
        component: UsersComponent,
        title: 'Users'
      },
      {
        path: 'claims',
        component: ClaimsComponent,
        title: 'Claims'
      },
      {
        path: 'contracts',
        component: ContractsComponent,
        title: 'Contracts'
      },
      {
        path: 'quotations',
        component: QuotationsComponent,
        title: 'Quotations'
      }
    ]
  },

  // Existing pages
  {
    path: 'dashboard-old',
    component: DashboardComponent
  },

  {
    path: 'services/marine-surveys',
    component: MarineSurveysComponent
  },
  {
    path: 'services/legal-assistance',
    component: LegalAssistanceComponent
  },
  {
    path: 'services/general-average',
    component: GeneralAverageComponent
  },
  {
    path: 'services/pollution',
    component: PollutionComponent
  },
  {
    path: 'services/stowaways',
    component: StowawayssComponent
  },
  {
    path: 'services/medical-assistance',
    component: MedicalAssistanceComponent
  },
  {
    path: 'services/customs-fines',
    component: CustomsFinesComponent
  },
  {
    path: 'services/contacts',
    component: ContactComponent
  },

  // Default route
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'login'
  }
];
