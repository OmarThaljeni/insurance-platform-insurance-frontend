import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

@Component({ selector: 'app-stowaways', standalone: true,
  imports: [CommonModule, RouterModule],
   templateUrl: './stowaways.component.html', styleUrl: '../services-page.css' })
 export class StowawayssComponent {}
