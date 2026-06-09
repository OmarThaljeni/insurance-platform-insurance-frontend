// quotations.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { RouterModule }                    from '@angular/router';
import { FormsModule }                     from '@angular/forms';
import {
  QuotationService,
  QuotationResponseDTO,
  QuotationRequestDTO,
} from '../../services/quotation.service';

interface QuotationForm {
  coverageType: string;
  vehicleValue: number | null;
  description: string;
}

const EMPTY_QUOTATION_FORM = (): QuotationForm => ({
  coverageType: '', vehicleValue: null, description: '',
});

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.css',
})
export class QuotationsComponent implements OnInit {

  currentUserRole = '';
  currentUserId   = 0;

  quotations:         QuotationResponseDTO[] = [];
  filteredQuotations: QuotationResponseDTO[] = [];
  quotationSearch       = '';
  quotationStatusFilter = 'all';
  totalQuotations       = 0;
  isLoadingQuotations   = false;
  quotationApiError     = '';

  showQuotationFormPanel = false;
  quotationForm: QuotationForm = EMPTY_QUOTATION_FORM();
  isSubmittingQuotation  = false;
  quotationFormError     = '';

  readonly coverageTypes = [
    'Marine Hull', 'P&I Liability', 'Cargo', 'General Average',
    'Pollution', 'Legal Assistance', 'Medical Assistance',
  ];

  constructor(private quotationService: QuotationService) {}

  ngOnInit(): void {
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.currentUserId   = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId') || 0);
    this.loadQuotations();
  }

  isAdmin(): boolean { return this.currentUserRole === 'ADMIN'; }

  // ── Load ─────────────────────────────────────────────────────────────────

  loadQuotations(): void {
    this.isLoadingQuotations = true; this.quotationApiError = '';
    this.quotationService.getAll().subscribe({
      next: (res) => {
        this.isLoadingQuotations = false;
        if (res.data) { this.quotations = res.data; this.applyFilters(); }
        else {
          this.quotations = []; this.filteredQuotations = []; this.totalQuotations = 0;
          this.quotationApiError = res.message || 'Failed to load quotations.';
        }
      },
      error: (err) => {
        this.isLoadingQuotations = false;
        this.quotations = []; this.filteredQuotations = []; this.totalQuotations = 0;
        this.quotationApiError = err?.error?.message || 'Failed to load quotations.';
      },
    });
  }

  applyFilters(): void {
    let data = [...this.quotations];
    if (this.quotationStatusFilter !== 'all') data = data.filter(q => q.status === this.quotationStatusFilter);
    const s = this.quotationSearch.toLowerCase().trim();
    if (s) data = data.filter(q => (q.vehicleType || '').toLowerCase().includes(s));
    this.filteredQuotations = data;
    this.totalQuotations    = data.length;
  }

  filterQuotations(): void             { this.applyFilters(); }
  setQuotationFilter(f: string): void  { this.quotationStatusFilter = f; this.applyFilters(); }

  // ── Create ────────────────────────────────────────────────────────────────

  openAddQuotationForm(): void {
    this.quotationForm = EMPTY_QUOTATION_FORM(); this.quotationFormError = '';
    this.showQuotationFormPanel = true;
    this.scrollTo('quotation-form-section');
  }

  closeQuotationForm(): void { this.showQuotationFormPanel = false; this.quotationFormError = ''; }

  submitQuotation(): void {
    this.quotationFormError = '';
    if (!this.quotationForm.coverageType) { this.quotationFormError = 'Coverage type is required.'; return; }
    this.isSubmittingQuotation = true;
    const dto: QuotationRequestDTO = {
      coverageType: this.quotationForm.coverageType,
      vehicleValue: this.quotationForm.vehicleValue || undefined,
      description:  this.quotationForm.description,
    };
    this.quotationService.create(dto, this.currentUserId).subscribe({
      next: (res) => {
        this.isSubmittingQuotation = false;
        if (res.data) { this.quotations.unshift(res.data); this.applyFilters(); this.closeQuotationForm(); }
        else { this.quotationFormError = res.message || 'Failed to create quotation.'; }
      },
      error: (err) => { this.isSubmittingQuotation = false; this.quotationFormError = err?.error?.message || 'Server error.'; },
    });
  }

  // ── Admin actions ─────────────────────────────────────────────────────────

  approveQuotation(q: QuotationResponseDTO): void {
    this.quotationService.approve(q.id).subscribe({
      next: (res) => { if (res.data) { const i = this.quotations.findIndex(x => x.id === q.id); if (i !== -1) this.quotations[i] = res.data; this.applyFilters(); } },
      error: (err) => console.error('Approve error', err),
    });
  }

  rejectQuotation(q: QuotationResponseDTO): void {
    this.quotationService.reject(q.id).subscribe({
      next: (res) => { if (res.data) { const i = this.quotations.findIndex(x => x.id === q.id); if (i !== -1) this.quotations[i] = res.data; this.applyFilters(); } },
      error: (err) => console.error('Reject error', err),
    });
  }

  deleteQuotation(q: QuotationResponseDTO): void {
    this.quotationService.delete(q.id).subscribe({
      next: () => { this.quotations = this.quotations.filter(x => x.id !== q.id); this.applyFilters(); },
      error: (err) => console.error('Delete quotation error', err),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getQuotationStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-urgent',
    };
    return map[status] || 'badge-closed';
  }

  private scrollTo(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showQuotationFormPanel) this.closeQuotationForm(); }
}
