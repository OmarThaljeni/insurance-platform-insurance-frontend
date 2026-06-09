// claims.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { RouterModule }                    from '@angular/router';
import { FormsModule }                     from '@angular/forms';
import {ClaimRequestDTO, ClaimResponseDTO, ClaimService} from "../../services/claim.service";

interface ClaimForm {
  title: string;
  description: string;
  contractId: number | null;
}

const EMPTY_CLAIM_FORM = (): ClaimForm => ({ title: '', description: '', contractId: null });

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './claims.component.html',
  styleUrl: './claims.component.css',
})
export class ClaimsComponent implements OnInit {

  currentUserRole = '';

  claims:         ClaimResponseDTO[] = [];
  filteredClaims: ClaimResponseDTO[] = [];
  claimSearch        = '';
  claimStatusFilter  = 'all';
  totalClaims        = 0;
  isLoadingClaims    = false;
  claimApiError      = '';

  showClaimFormPanel = false;
  claimForm: ClaimForm = EMPTY_CLAIM_FORM();
  isSubmittingClaim  = false;
  claimFormError     = '';

  // Assign expert
  assignTarget: ClaimResponseDTO | null = null;
  assignExpertId: number | null = null;
  isAssigning = false;

  // Report
  reportTarget: ClaimResponseDTO | null = null;
  reportText = '';
  isSubmittingReport = false;

  // Delete claim
  deleteClaimTarget: ClaimResponseDTO | null = null;
  isDeletingClaim = false;

  readonly claimStatuses = ['PENDING', 'ASSIGNED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED'];

  constructor(private claimService: ClaimService) {}

  ngOnInit(): void {
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.loadClaims();
  }

  isAdmin():  boolean { return this.currentUserRole === 'ADMIN'; }
  isExpert(): boolean { return this.currentUserRole === 'EXPERT'; }

  // ── Load ─────────────────────────────────────────────────────────────────

  loadClaims(): void {
    this.isLoadingClaims = true; this.claimApiError = '';
    this.claimService.getAll().subscribe({
      next: (res: any) => {
        this.isLoadingClaims = false;
        const data = res?.data ?? res;
        if (Array.isArray(data)) {
          this.claims = data;
          this.applyFilters();
        } else {
          this.claims = []; this.claimApiError = res?.message || 'Failed to load claims.';
        }
      },
      error: (err) => {
        this.isLoadingClaims = false;
        this.claims = []; this.filteredClaims = []; this.totalClaims = 0;
        this.claimApiError = err?.error?.message || 'Failed to load claims.';
      },
    });
  }

  applyFilters(): void {
    let data = [...this.claims];
    if (this.claimStatusFilter !== 'all') data = data.filter(c => c.status === this.claimStatusFilter);
    const s = this.claimSearch.toLowerCase().trim();
    if (s) data = data.filter(c =>
      c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
    this.filteredClaims = data;
    this.totalClaims    = data.length;
  }

  filterClaims(): void             { this.applyFilters(); }
  setClaimFilter(f: string): void  { this.claimStatusFilter = f; this.applyFilters(); }

  // ── Create ────────────────────────────────────────────────────────────────

  openAddClaimForm(): void {
    this.claimForm = EMPTY_CLAIM_FORM(); this.claimFormError = '';
    this.showClaimFormPanel = true;
    this.scrollTo('claim-form-section');
  }

  closeClaimForm(): void { this.showClaimFormPanel = false; this.claimFormError = ''; }

  submitClaim(): void {
    this.claimFormError = '';
    if (!this.claimForm.title?.trim())       { this.claimFormError = 'Title is required.'; return; }
    if (!this.claimForm.description?.trim()) { this.claimFormError = 'Description is required.'; return; }
    if (!this.claimForm.contractId)          { this.claimFormError = 'Contract ID is required.'; return; }

    this.isSubmittingClaim = true;
    const userId = Number(localStorage.getItem('userId'));
    const dto: ClaimRequestDTO = {
      title:       this.claimForm.title.trim(),
      description: this.claimForm.description.trim(),
      contractId:  this.claimForm.contractId,
      userId,
    };

    this.claimService.create(dto).subscribe({
      next: (res) => {
        this.isSubmittingClaim = false;
        if (res.data) {
          this.claims.unshift(res.data);
          this.applyFilters();
          this.closeClaimForm();
          this.claimForm = EMPTY_CLAIM_FORM();
        } else {
          this.claimFormError = res.message || 'Failed to create claim.';
        }
      },
      error: (err) => { this.isSubmittingClaim = false; this.claimFormError = err?.error?.message || 'Server error.'; },
    });
  }

  // ── Status ────────────────────────────────────────────────────────────────

  updateClaimStatus(claim: ClaimResponseDTO, status: string): void {
    this.claimService.updateStatus(claim.id, status).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === claim.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyFilters();
        }
      },
      error: (err) => console.error('Update status error', err),
    });
  }

  // ── Assign Expert ─────────────────────────────────────────────────────────

  openAssignExpert(claim: ClaimResponseDTO): void { this.assignTarget = claim; this.assignExpertId = null; }
  cancelAssign(): void                             { this.assignTarget = null; this.assignExpertId = null; }

  executeAssign(): void {
    if (!this.assignTarget || !this.assignExpertId) return;
    this.isAssigning = true;
    this.claimService.assignExpert(this.assignTarget.id, this.assignExpertId).subscribe({
      next: (res) => {
        this.isAssigning = false;
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === this.assignTarget!.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyFilters();
        }
        this.cancelAssign();
      },
      error: (err) => { this.isAssigning = false; console.error('Assign error', err); },
    });
  }

  // ── Report ────────────────────────────────────────────────────────────────

  openReportModal(claim: ClaimResponseDTO): void { this.reportTarget = claim; this.reportText = ''; }
  cancelReport(): void                            { this.reportTarget = null; this.reportText = ''; }

  submitReport(): void {
    if (!this.reportTarget || !this.reportText.trim()) return;
    this.isSubmittingReport = true;
    this.claimService.submitReport(this.reportTarget.id, this.reportText.trim()).subscribe({
      next: (res) => {
        this.isSubmittingReport = false;
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === this.reportTarget!.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyFilters();
        }
        this.cancelReport();
      },
      error: (err) => { this.isSubmittingReport = false; console.error('Report error', err); },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDeleteClaim(claim: ClaimResponseDTO): void { this.deleteClaimTarget = claim; }
  cancelDeleteClaim(): void                          { this.deleteClaimTarget = null; }

  executeDeleteClaim(): void {
    if (!this.deleteClaimTarget) return;
    this.isDeletingClaim = true;
    this.claimService.delete(this.deleteClaimTarget.id).subscribe({
      next: () => {
        this.claims = this.claims.filter(c => c.id !== this.deleteClaimTarget!.id);
        this.deleteClaimTarget = null; this.isDeletingClaim = false;
        this.applyFilters();
      },
      error: (err) => { this.isDeletingClaim = false; console.error(err); },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getClaimStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', ASSIGNED: 'badge-open',
      UNDER_REVIEW: 'badge-review', APPROVED: 'badge-approved',
      REJECTED: 'badge-urgent', CLOSED: 'badge-closed',
    };
    return map[status] || 'badge-closed';
  }

  private scrollTo(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showClaimFormPanel) this.closeClaimForm();
    if (this.assignTarget)       this.cancelAssign();
    if (this.reportTarget)       this.cancelReport();
    if (this.deleteClaimTarget)  this.cancelDeleteClaim();
  }
}
