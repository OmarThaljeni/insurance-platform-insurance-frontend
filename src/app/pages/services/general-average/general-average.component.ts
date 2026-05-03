import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

@Component({
  selector: 'app-general-average',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './general-average.component.html',
  styleUrl: '../services-page.css'
})
export class GeneralAverageComponent {}
