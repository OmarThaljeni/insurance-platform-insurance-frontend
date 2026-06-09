// dashboard-home.component.ts  — the "/" overview card (stats + quick access)
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule }   from '@angular/router';
import { ClaimService, ClaimResponseDTO }         from '../../services/claim.service';
import { ContractService }                        from '../../services/contract.service';
import { QuotationService }                       from '../../services/quotation.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css',
})
export class DashboardHomeComponent implements OnInit {

  firstName    = '';
  today        = new Date();

  recentClaims: ClaimResponseDTO[] = [];

  stats = { vessels: 12, openClaims: 0, totalContracts: 0, pendingQuotations: 0 };

  constructor(
    private claimService:     ClaimService,
    private contractService:  ContractService,
    private quotationService: QuotationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || 'User';
    this.firstName = stored.trim().split(' ')[0] || 'User';

    this.claimService.getAll().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        if (Array.isArray(data)) {
          this.recentClaims    = data.slice(0, 5);
          this.stats.openClaims = data.filter((c: any) =>
            ['PENDING', 'ASSIGNED', 'UNDER_REVIEW'].includes(c.status)).length;
        }
      },
    });

    this.contractService.getAll().subscribe({
      next: (res) => { if (res.data) this.stats.totalContracts = res.data.length; },
    });

    this.quotationService.getAll().subscribe({
      next: (res) => {
        if (res.data)
          this.stats.pendingQuotations = res.data.filter(q => q.status === 'PENDING').length;
      },
    });
  }

  getClaimStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', ASSIGNED: 'badge-open',
      UNDER_REVIEW: 'badge-review', APPROVED: 'badge-approved',
      REJECTED: 'badge-urgent', CLOSED: 'badge-closed',
    };
    return map[status] || 'badge-closed';
  }
}
