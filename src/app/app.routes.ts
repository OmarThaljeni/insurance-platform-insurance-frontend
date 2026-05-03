import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MarineSurveysComponent } from './pages/services/marine-surveys/marine-surveys.component';
import { LegalAssistanceComponent } from './pages/services/legal-assistance/legal-assistance.component';
import { GeneralAverageComponent } from './pages/services/general-average/general-average.component';
import { PollutionComponent } from './pages/services/pollution/pollution.component';
import { MedicalAssistanceComponent } from './pages/services/medical-assistance/medical-assistance.component';
import { CustomsFinesComponent } from './pages/services/customs-fines/customs-fines.component';
import {StowawayssComponent} from "./pages/services/stowaways/stowaways.component";
import {ContactComponent} from "./pages/contact/contact.component";

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'services/marine-surveys', component: MarineSurveysComponent },
  { path: 'services/legal-assistance', component: LegalAssistanceComponent },
  { path: 'services/general-average', component: GeneralAverageComponent },
  { path: 'services/pollution', component: PollutionComponent },
  { path: 'services/stowaways', component: StowawayssComponent },
  { path: 'services/medical-assistance', component: MedicalAssistanceComponent },
  { path: 'services/customs-fines', component: CustomsFinesComponent },
  { path: 'services/contacts', component: ContactComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
