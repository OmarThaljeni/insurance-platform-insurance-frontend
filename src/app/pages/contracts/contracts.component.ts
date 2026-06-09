// contracts.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { RouterModule }                    from '@angular/router';
import { FormsModule }                     from '@angular/forms';
import {
  ContractService,
  ContractResponseDTO,
  ContractRequestDTO,
} from '../../services/contract.service';

interface ContractForm { quotationId: number | null; }
const EMPTY_CONTRACT_FORM = (): ContractForm => ({ quotationId: null });

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css',
})
export class ContractsComponent implements OnInit {

  currentUserRole = '';

  contracts:         ContractResponseDTO[] = [];
  filteredContracts: ContractResponseDTO[] = [];
  contractSearch       = '';
  contractStatusFilter = 'all';
  totalContracts       = 0;
  isLoadingContracts   = false;
  contractApiError     = '';

  showContractFormPanel  = false;
  contractForm: ContractForm = EMPTY_CONTRACT_FORM();
  isSubmittingContract   = false;
  contractFormError      = '';

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.loadContracts();
  }

  isAdmin(): boolean { return this.currentUserRole === 'ADMIN'; }

  // ── Load ─────────────────────────────────────────────────────────────────

  loadContracts(): void {
    this.isLoadingContracts = true; this.contractApiError = '';
    this.contractService.getAll().subscribe({
      next: (res) => {
        this.isLoadingContracts = false;
        if (res.data) { this.contracts = res.data; this.applyFilters(); }
        else {
          this.contracts = []; this.filteredContracts = []; this.totalContracts = 0;
          this.contractApiError = res.message || 'Failed to load contracts.';
        }
      },
      error: (err) => {
        this.isLoadingContracts = false;
        this.contracts = []; this.filteredContracts = []; this.totalContracts = 0;
        this.contractApiError = err?.error?.message || 'Failed to load contracts.';
      },
    });
  }

  applyFilters(): void {
    let data = [...this.contracts];
    if (this.contractStatusFilter !== 'all') data = data.filter(c => c.status === this.contractStatusFilter);
    const s = this.contractSearch.toLowerCase().trim();
    if (s) data = data.filter(c =>
      String(c.id).includes(s) || String(c.userId).includes(s) || String(c.quotationId).includes(s));
    this.filteredContracts = data;
    this.totalContracts    = data.length;
  }

  filterContracts(): void            { this.applyFilters(); }
  setContractFilter(f: string): void { this.contractStatusFilter = f; this.applyFilters(); }

  // ── Create ────────────────────────────────────────────────────────────────

  openAddContractForm(): void {
    this.contractForm = EMPTY_CONTRACT_FORM(); this.contractFormError = '';
    this.showContractFormPanel = true;
    this.scrollTo('contract-form-section');
  }

  closeContractForm(): void { this.showContractFormPanel = false; this.contractFormError = ''; }

  submitContract(): void {
    this.contractFormError = '';
    if (!this.contractForm.quotationId) { this.contractFormError = 'Approved Quotation ID is required.'; return; }
    this.isSubmittingContract = true;
    const dto: ContractRequestDTO = { quotationId: this.contractForm.quotationId! };
    this.contractService.create(dto).subscribe({
      next: (res) => {
        this.isSubmittingContract = false;
        if (res.data) { this.contracts.unshift(res.data); this.applyFilters(); this.closeContractForm(); }
        else { this.contractFormError = res.message || 'Failed to create contract.'; }
      },
      error: (err) => {
        this.isSubmittingContract = false;
        this.contractFormError =
          err?.error?.message ||
          (err.status === 400 ? 'Quotation must be APPROVED.' :
            err.status === 404 ? 'Quotation not found.' : 'Server error.');
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  acceptContract(contract: ContractResponseDTO): void {
    this.contractService.accept(contract.id).subscribe({
      next: (res) => { if (res.data) { const i = this.contracts.findIndex(c => c.id === contract.id); if (i !== -1) this.contracts[i] = res.data; this.applyFilters(); } },
      error: (err) => console.error('Accept error', err),
    });
  }

  payContract(contract: ContractResponseDTO): void {
    this.contractService.pay(contract.id).subscribe({
      next: (res) => { if (res.data) { const i = this.contracts.findIndex(c => c.id === contract.id); if (i !== -1) this.contracts[i] = res.data; this.applyFilters(); } },
      error: (err) => console.error('Pay error', err),
    });
  }

  cancelContract(contract: ContractResponseDTO): void {
    this.contractService.cancel(contract.id).subscribe({
      next: (res) => { if (res.data) { const i = this.contracts.findIndex(c => c.id === contract.id); if (i !== -1) this.contracts[i] = res.data; this.applyFilters(); } },
      error: (err) => console.error('Cancel error', err),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getContractStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', ACTIVE: 'badge-open',
      ACCEPTED: 'badge-approved', PAID: 'badge-approved',
      CANCELLED: 'badge-urgent', EXPIRED: 'badge-closed',
    };
    return map[status] || 'badge-closed';
  }

  private scrollTo(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showContractFormPanel) this.closeContractForm(); }
}
