import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

 @Component({ selector: 'app-medical-assistance', standalone: true,
   imports: [CommonModule, RouterModule],
   templateUrl: './medical-assistance.component.html', styleUrl: '../services-page.css' })
 export class MedicalAssistanceComponent {}
