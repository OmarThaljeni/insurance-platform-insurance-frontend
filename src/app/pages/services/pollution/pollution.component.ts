import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

 @Component({ selector: 'app-pollution',
   standalone: true,
   imports: [CommonModule, RouterModule],
  templateUrl: './pollution.component.html',
   styleUrl: '../services-page.css'
 })

 export class PollutionComponent {
 }
