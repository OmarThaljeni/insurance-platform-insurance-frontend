import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-marine-surveys',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './marine-surveys.component.html',
  styleUrl: '../services-page.css',
})
export class MarineSurveysComponent {}
