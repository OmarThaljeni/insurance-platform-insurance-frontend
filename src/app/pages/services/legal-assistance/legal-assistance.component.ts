import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {Component} from "@angular/core";

@Component({
  selector: 'app-legal-assistance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './legal-assistance.component.html',
  styleUrl: '../services-page.css'
})
export class LegalAssistanceComponent {}
