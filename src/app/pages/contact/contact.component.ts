import {RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";

export interface Contact {
  name: string;
  role?: string;
  phones: string[];
  fax?: string;
  email: string;
  website?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: '../services/services-page.css' })

export class ContactComponent {

  contacts: Contact[] = [
    {
      name: 'Ing. Khaled GMATI',
      role: 'General Manager — Tunis HQ',
      phones: [
        '00 216 71 950 741',
        '00 216 71 950 589',
        '00 216 98 346 749'
      ],
      fax: '00 216 71 950 650',
      email: 'khaled.gmati@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Ing. Makram MEJRI',
      role: 'Branch Bizerte Manager',
      phones: [
        '00 216 72 439 506',
        '00 216 98 346 743'
      ],
      email: 'tipic.bizerte@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Mr. Ali Zrida',
      role: 'Sousse Branch Manager',
      phones: [
        '00 216 73 213 740',
        '00 216 94 990 731'
      ],
      email: 'tipic.sousse@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Mr Jalel Messaoued',
      role: 'Branch Sfax Manager',
      phones: [
        '00 216 74 298 734',
        '00 216 74 221 400',
        '00 216 98 337 491'
      ],
      email: 'tipic.sfax@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Mr Sofien Marouani',
      role: 'Sfax Branch',
      phones: [
        '00 216 74 298 734',
        '00 216 96 857 657'
      ],
      email: 'tipic.sfax@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Mehdi Dahen',
      role: 'Legal Department Manager',
      phones: [
        '00 216 71 950 741',
        '00 216 98 675 717'
      ],
      fax: '00 216 71 950 650',
      email: 'mehdi.dahen@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Jamel BEN NACEUR',
      role: 'Financial Department',
      phones: [
        '00 216 71 950 741',
        '00 216 96 663 207'
      ],
      fax: '00 216 71 950 650',
      email: 'jamel.bennaceur@tipic.com.tn',
      website: 'www.tipic.com.tn'
    },
    {
      name: 'Sami JEBALI',
      role: 'Accounting Department',
      phones: [
        '00 216 71 950 741',
        '00 216 98 506 428'
      ],
      fax: '00 216 71 950 650',
      email: 'sami.jebali@tipic.com.tn',
      website: 'www.tipic.com.tn'
    }
  ];

}
