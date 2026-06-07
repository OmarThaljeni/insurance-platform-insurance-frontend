// dashboard.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { Router, RouterModule }            from '@angular/router';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AuthService }                     from '../../services/auth.service';
import {
  UserService,
  UserResponseDTO,
  UserRequestDTO,
} from '../../services/user.service';
import {
  ClaimService,
  ClaimResponseDTO,
  ClaimRequestDTO,
} from '../../services/claim.service';
import {
  ContractService,
  ContractResponseDTO,
  ContractRequestDTO,
} from '../../services/contract.service';
import {
  QuotationService,
  QuotationResponseDTO,
  QuotationRequestDTO,
} from '../../services/quotation.service';

// ─── Local interfaces ────────────────────────────────────────────────────────

interface DashboardStats {
  vessels: number;
  openClaims: number;
  crewAssisted: number;
  pendingActions: number;
}

// ─── User Form ───────────────────────────────────────────────────────────────

interface UserForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'CLIENT' | 'EXPERT';
}

const EMPTY_USER_FORM = (): UserForm => ({
  fullName: '', email: '', username: '', password: '', role: 'CLIENT',
});

// ─── Claim Form ──────────────────────────────────────────────────────────────

interface ClaimForm {
  title: string;
  description: string;
  contractId: number | null;
}

const EMPTY_CLAIM_FORM = (): ClaimForm => ({
  title: '', description: '', contractId: null,
});

// ─── Contract Form ───────────────────────────────────────────────────────────

interface ContractForm {
  quotationId: number | null;
}

const EMPTY_CONTRACT_FORM = (): ContractForm => ({
  quotationId: null,
});

// ─── Quotation Form ──────────────────────────────────────────────────────────

interface QuotationForm {
  coverageType: string;
  vehicleValue: number | null;
  description: string;
}

const EMPTY_QUOTATION_FORM = (): QuotationForm => ({
  coverageType: '', vehicleValue: null, description: '',
});

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  // ── USER INFO ──────────────────────────────────
  userName     = '';
  firstName    = '';
  lastName     = '';
  userInitials = '';
  currentUserId: number = 0;
  currentUserRole: string = 'CLIENT';

  // ── NAV STATE ──────────────────────────────────
  activeRoute    = 'dashboard';
  openDropdown   = '';
  mobileMenuOpen = false;

  // ── SECTION VISIBILITY ─────────────────────────
  showUserManagement   = true;   // visible by default
  showClaimManagement  = false;
  showContractSection  = false;
  showQuotationSection = false;

  today = new Date();

  // ── STATS ──────────────────────────────────────
  stats: DashboardStats = {
    vessels: 12, openClaims: 0, crewAssisted: 37, pendingActions: 0,
  };

  // ══════════════════════════════════════════════
  // USER MANAGEMENT
  // ══════════════════════════════════════════════

  users:         UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];
  userSearch = '';
  userFilter: 'all' | 'active' | 'inactive' = 'all';
  totalUsers = 0;
  isLoadingUsers = false;
  apiError = '';
  deleteTarget: UserResponseDTO | null = null;
  isDeleting = false;
  showUserFormPanel = false;
  isEditUserMode = false;
  editUserTargetId: number | null = null;
  isSubmittingUser = false;
  userFormError = '';
  userFormSuccess = '';
  userForm: UserForm = EMPTY_USER_FORM();

  // ══════════════════════════════════════════════
  // CLAIM MANAGEMENT
  // ══════════════════════════════════════════════

  claims: ClaimResponseDTO[] = [];
  filteredClaims: ClaimResponseDTO[] = [];
  claimSearch = '';
  claimStatusFilter: string = 'all';
  totalClaims = 0;
  isLoadingClaims = false;
  claimApiError = '';

  showClaimFormPanel = false;
  claimForm: ClaimForm = EMPTY_CLAIM_FORM();
  isSubmittingClaim = false;
  claimFormError = '';

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

  // ══════════════════════════════════════════════
  // CONTRACT SECTION
  // ══════════════════════════════════════════════

  contracts: ContractResponseDTO[] = [];
  filteredContracts: ContractResponseDTO[] = [];
  contractSearch = '';
  contractStatusFilter = 'all';
  totalContracts = 0;
  isLoadingContracts = false;
  contractApiError = '';

  // Contract form
  showContractFormPanel = false;
  contractForm: ContractForm = EMPTY_CONTRACT_FORM();
  isSubmittingContract = false;
  contractFormError = '';

  // ══════════════════════════════════════════════
  // QUOTATION SECTION
  // ══════════════════════════════════════════════

  quotations: QuotationResponseDTO[] = [];
  filteredQuotations: QuotationResponseDTO[] = [];
  quotationSearch = '';
  quotationStatusFilter = 'all';
  totalQuotations = 0;
  isLoadingQuotations = false;
  quotationApiError = '';
  userCtrl = new FormControl();
  selectedUserId: number | null = null;

  showQuotationFormPanel = false;
  quotationForm: QuotationForm = EMPTY_QUOTATION_FORM();
  isSubmittingQuotation = false;
  quotationFormError = '';
  userSearchText = '';

  readonly coverageTypes = [
    'Marine Hull', 'P&I Liability', 'Cargo', 'General Average',
    'Pollution', 'Legal Assistance', 'Medical Assistance',
  ];

  constructor(
    private authService:      AuthService,
    private router:           Router,
    private userService:      UserService,
    private claimService:     ClaimService,
    private contractService:  ContractService,
    private quotationService: QuotationService,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadUsers();
    this.loadClaims();
    this.loadContracts();
    this.loadQuotations();
    this.initUserAutocomplete();
  }

  // ══════════════════════════════════════════════
  // USER MANAGEMENT
  // ══════════════════════════════════════════════

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.apiError = '';
    this.userService.getAll().subscribe({
      next: (res) => {
        this.isLoadingUsers = false;
        if (res.data) {
          this.users = res.data.map(u => ({
            ...u,
            fullName: u.username,
            createdAt: new Date().toISOString(),
          }));
          this.applyUserFilters();
        } else {
          this.users = [];
          this.filteredUsers = [];
          this.totalUsers = 0;
          this.apiError = res.message || 'Failed to load users.';
        }
      },
      error: (err) => {
        this.isLoadingUsers = false;
        this.users = []; this.filteredUsers = []; this.totalUsers = 0;
        this.apiError = err?.error?.message ||
          (err.status === 403 ? 'Access denied — ADMIN role required.' :
            err.status === 0   ? 'Cannot reach server.' : 'Unexpected error.');
      },
    });
  }

  searchUsers() {
    if (this.userSearchText.length < 2) {
      this.filteredUsers = [];
      return;
    }

    this.userService.searchUsers(this.userSearchText)
      .subscribe({
        next: (res) => {
          this.filteredUsers = res.data;
        }
      });
  }

  selectUser(user: any) {
    this.selectedUserId = user.id;
    this.userCtrl.setValue(user);
  }

  initUserAutocomplete(): void {
    this.userCtrl.valueChanges.subscribe(value => {
      const query =
        typeof value === 'string'
          ? value
          : value?.fullName || '';
      if (!query || query.length < 2) {
        this.filteredUsers = [];
        return;
      }
      this.userService.searchUsers(query)
        .subscribe({
          next: (res) => {
            this.filteredUsers = res.data || [];
          },
          error: () => {
            this.filteredUsers = [];
          }
        });
    });
  }

  applyUserFilters(): void {
    let data = [...this.users];
    if (this.userFilter === 'active')   data = data.filter(u => u.status === 'ACTIVE');
    if (this.userFilter === 'inactive') data = data.filter(u => u.status === 'INACTIVE');
    const s = this.userSearch.toLowerCase().trim();
    if (s) data = data.filter(u =>
      u.fullName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)    ||
      u.username.toLowerCase().includes(s)
    );
    this.filteredUsers = data;
    this.totalUsers    = data.length;
  }

  filterUsers(): void { this.applyUserFilters(); }
  setUserFilter(f: 'all' | 'active' | 'inactive'): void { this.userFilter = f; this.applyUserFilters(); }

  toggleUserStatus(user: UserResponseDTO): void {
    const obs = user.status === 'ACTIVE'
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);
    obs.subscribe({
      next: (res) => {
        if (res.status === 200 || res.status === 201) {
          const idx = this.users.findIndex(u => u.id === user.id);
          if (idx !== -1) this.users[idx] = { ...res.data, fullName: res.data.username, createdAt: this.users[idx].createdAt };
          this.applyUserFilters();
        }
      },
      error: (err) => console.error('Toggle status error', err),
    });
  }

  confirmDelete(user: UserResponseDTO): void { this.deleteTarget = user; }
  cancelDelete(): void  { this.deleteTarget = null; }

  executeDelete(): void {
    const target = this.deleteTarget;
    if (!target) return;
    this.isDeleting = true;
    this.userService.delete(target.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== target.id);
        this.deleteTarget = null; this.isDeleting = false;
        this.applyUserFilters();
      },
      error: (err) => { this.isDeleting = false; console.error('Delete error', err); },
    });
  }

  openAddUserForm(): void {
    this.isEditUserMode = false; this.editUserTargetId = null;
    this.userForm = EMPTY_USER_FORM(); this.userFormError = ''; this.userFormSuccess = '';
    this.showUserFormPanel = true; this.scrollTo('user-form-section');
  }

  openEditUserForm(user: UserResponseDTO): void {
    this.isEditUserMode = true; this.editUserTargetId = user.id;
    this.userForm = { fullName: user.fullName, email: user.email, username: user.username, password: '', role: user.role as any };
    this.userFormError = ''; this.userFormSuccess = '';
    this.showUserFormPanel = true; this.scrollTo('user-form-section');
  }

  closeUserFormPanel(): void { this.showUserFormPanel = false; this.userFormError = ''; this.userFormSuccess = ''; }

  submitUserForm(): void {
    this.userFormError = ''; this.userFormSuccess = '';
    if (!this.userForm.fullName.trim()) { this.userFormError = 'Full name is required.'; return; }
    if (!this.userForm.email.trim())    { this.userFormError = 'Email is required.'; return; }
    if (!this.userForm.username.trim()) { this.userFormError = 'Username is required.'; return; }
    if (!this.isEditUserMode && !this.userForm.password) { this.userFormError = 'Password is required for new users.'; return; }
    this.isSubmittingUser = true;
    const dto: UserRequestDTO = {
      fullName: this.userForm.fullName.trim(),
      email:    this.userForm.email.trim(),
      username: this.userForm.username.trim(),
      role:     this.userForm.role,
      ...(this.userForm.password ? { password: this.userForm.password } : {}),
    };
    const obs = this.isEditUserMode && this.editUserTargetId !== null
      ? this.userService.update(this.editUserTargetId, dto)
      : this.userService.create(dto);
    obs.subscribe({
      next: (res) => {
        this.isSubmittingUser = false;
        if (res.status === 200 || res.status === 201) {
          if (this.isEditUserMode) {
            const idx = this.users.findIndex(u => u.id === this.editUserTargetId);
            if (idx !== -1) this.users[idx] = { ...res.data, fullName: res.data.username, createdAt: this.users[idx].createdAt };
          } else {
            this.users.unshift({ ...res.data, fullName: res.data.username, createdAt: new Date().toISOString() });
          }
          this.applyUserFilters();
          this.userFormSuccess = this.isEditUserMode ? 'User updated successfully.' : 'User created successfully.';
          setTimeout(() => this.closeUserFormPanel(), 1500);
        } else {
          this.userFormError = res.message || 'Operation failed.';
        }
      },
      error: (err) => {
        this.isSubmittingUser = false;
        this.userFormError = err?.error?.message ||
          (err.status === 400 ? 'Invalid data.' : err.status === 409 ? 'Username or email already exists.' : 'Server error.');
      },
    });
  }

  // ══════════════════════════════════════════════
  // CLAIM MANAGEMENT
  // ══════════════════════════════════════════════

  loadClaims(): void {
    this.isLoadingClaims = true;
    this.claimApiError = '';
    this.claimService.getAll().subscribe({
      next: (res: any) => {
        this.isLoadingClaims = false;

        const data = res?.data ?? res;

        if (Array.isArray(data)) {
          this.claims = data;
          this.applyClaimFilters();
        } else {
          this.claims = [];
          this.claimApiError = res?.message || 'Failed to load claims.';
        }
      },
      error: (err) => {
        this.isLoadingClaims = false;
        this.claims = []; this.filteredClaims = []; this.totalClaims = 0;
        this.claimApiError = err?.error?.message || 'Failed to load claims.';
      },
    });
  }

  applyClaimFilters(): void {
    let data = [...this.claims];
    if (this.claimStatusFilter !== 'all') data = data.filter(c => c.status === this.claimStatusFilter);
    const s = this.claimSearch.toLowerCase().trim();
    if (s) data = data.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
    this.filteredClaims = data;
    this.totalClaims    = data.length;
  }

  filterClaims(): void { this.applyClaimFilters(); }
  setClaimFilter(f: string): void { this.claimStatusFilter = f; this.applyClaimFilters(); }

  openAddClaimForm(): void {
    this.claimForm = EMPTY_CLAIM_FORM(); this.claimFormError = '';
    this.showClaimFormPanel = true; this.scrollTo('claim-form-section');
  }

  closeClaimForm(): void { this.showClaimFormPanel = false; this.claimFormError = ''; }

  submitClaim(): void {

    this.claimFormError = '';

    if (!this.claimForm.title?.trim()) {
      this.claimFormError = 'Title is required.';
      return;
    }

    if (!this.claimForm.description?.trim()) {
      this.claimFormError = 'Description is required.';
      return;
    }

    if (!this.claimForm.contractId) {
      this.claimFormError = 'Contract ID is required.';
      return;
    }


    this.isSubmittingClaim = true;
    const userId = Number(localStorage.getItem('userId'));
    const dto: ClaimRequestDTO = {
      title: this.claimForm.title.trim(),
      description: this.claimForm.description.trim(),
      contractId: this.claimForm.contractId,
      userId: userId
    };

    this.claimService.create(dto).subscribe({
      next: (res) => {
        this.isSubmittingClaim = false;

        if (res.data) {
          this.claims.unshift(res.data);
          this.applyClaimFilters();
          this.closeClaimForm();

          // reset form
          this.resetClaimForm();
        } else {
          this.claimFormError = res.message || 'Failed to create claim.';
        }
      },
      error: (err) => {
        this.isSubmittingClaim = false;
        this.claimFormError = err?.error?.message || 'Server error.';
      }
    });
  }

  resetClaimForm(): void {
    this.claimForm = {
      title: '',
      description: '',
      contractId: null
    };

    this.selectedUserId = null;
    this.userSearchText = '';
    this.filteredUsers = [];
  }

  updateClaimStatus(claim: ClaimResponseDTO, status: string): void {
    this.claimService.updateStatus(claim.id, status).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === claim.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyClaimFilters();
        }
      },
      error: (err) => console.error('Update status error', err),
    });
  }

  openAssignExpert(claim: ClaimResponseDTO): void {
    this.assignTarget = claim; this.assignExpertId = null;
  }

  cancelAssign(): void { this.assignTarget = null; this.assignExpertId = null; }

  executeAssign(): void {
    if (!this.assignTarget || !this.assignExpertId) return;
    this.isAssigning = true;
    this.claimService.assignExpert(this.assignTarget.id, this.assignExpertId).subscribe({
      next: (res) => {
        this.isAssigning = false;
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === this.assignTarget!.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyClaimFilters();
        }
        this.cancelAssign();
      },
      error: (err) => { this.isAssigning = false; console.error('Assign error', err); },
    });
  }

  openReportModal(claim: ClaimResponseDTO): void { this.reportTarget = claim; this.reportText = ''; }
  cancelReport(): void { this.reportTarget = null; this.reportText = ''; }

  submitReport(): void {
    if (!this.reportTarget || !this.reportText.trim()) return;
    this.isSubmittingReport = true;
    this.claimService.submitReport(this.reportTarget.id, this.reportText.trim()).subscribe({
      next: (res) => {
        this.isSubmittingReport = false;
        if (res.data) {
          const idx = this.claims.findIndex(c => c.id === this.reportTarget!.id);
          if (idx !== -1) this.claims[idx] = res.data;
          this.applyClaimFilters();
        }
        this.cancelReport();
      },
      error: (err) => { this.isSubmittingReport = false; console.error('Report error', err); },
    });
  }

  confirmDeleteClaim(claim: ClaimResponseDTO): void { this.deleteClaimTarget = claim; }
  cancelDeleteClaim(): void { this.deleteClaimTarget = null; }

  executeDeleteClaim(): void {
    if (!this.deleteClaimTarget) return;
    this.isDeletingClaim = true;
    this.claimService.delete(this.deleteClaimTarget.id).subscribe({
      next: () => {
        this.claims = this.claims.filter(c => c.id !== this.deleteClaimTarget!.id);
        this.deleteClaimTarget = null; this.isDeletingClaim = false;
        this.applyClaimFilters();
      },
      error: (err) => { this.isDeletingClaim = false; console.error(err); },
    });
  }

  getClaimStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', ASSIGNED: 'badge-open',
      UNDER_REVIEW: 'badge-review', APPROVED: 'badge-approved',
      REJECTED: 'badge-urgent',  CLOSED: 'badge-closed',
    };
    return map[status] || 'badge-closed';
  }

  // ══════════════════════════════════════════════
  // CONTRACT SECTION
  // ══════════════════════════════════════════════

  loadContracts(): void {
    this.isLoadingContracts = true;
    this.contractApiError = '';
    this.contractService.getAll().subscribe({
      next: (res) => {
        this.isLoadingContracts = false;
        if (res.data) {
          this.contracts = res.data;
          this.applyContractFilters();
        } else {
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

  applyContractFilters(): void {
    let data = [...this.contracts];
    if (this.contractStatusFilter !== 'all') data = data.filter(c => c.status === this.contractStatusFilter);
    const s = this.contractSearch.toLowerCase().trim();
    if (s) data = data.filter(c =>
      String(c.id).includes(s) || String(c.userId).includes(s) || String(c.quotationId).includes(s)
    );
    this.filteredContracts = data;
    this.totalContracts    = data.length;
  }

  filterContracts(): void { this.applyContractFilters(); }
  setContractFilter(f: string): void { this.contractStatusFilter = f; this.applyContractFilters(); }

  openAddContractForm(): void {
    this.contractForm = EMPTY_CONTRACT_FORM();
    this.contractFormError = '';
    this.showContractFormPanel = true;
    this.scrollTo('contract-form-section');
  }

  closeContractForm(): void {
    this.showContractFormPanel = false;
    this.contractFormError = '';
  }

  submitContract(): void {
    this.contractFormError = '';
    if (!this.contractForm.quotationId) {
      this.contractFormError = 'Approved Quotation ID is required.';
      return;
    }
    this.isSubmittingContract = true;
    const dto: ContractRequestDTO = { quotationId: this.contractForm.quotationId! };
    this.contractService.create(dto).subscribe({
      next: (res) => {
        this.isSubmittingContract = false;
        if (res.data) {
          this.contracts.unshift(res.data);
          this.applyContractFilters();
          this.closeContractForm();
        } else {
          this.contractFormError = res.message || 'Failed to create contract.';
        }
      },
      error: (err) => {
        this.isSubmittingContract = false;
        this.contractFormError =
          err?.error?.message ||
          (err.status === 400 ? 'Quotation must be APPROVED to create a contract.' :
            err.status === 404 ? 'Quotation not found.' : 'Server error.');
      },
    });
  }

  acceptContract(contract: ContractResponseDTO): void {
    this.contractService.accept(contract.id).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.contracts.findIndex(c => c.id === contract.id);
          if (idx !== -1) this.contracts[idx] = res.data;
          this.applyContractFilters();
        }
      },
      error: (err) => console.error('Accept error', err),
    });
  }

  payContract(contract: ContractResponseDTO): void {
    this.contractService.pay(contract.id).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.contracts.findIndex(c => c.id === contract.id);
          if (idx !== -1) this.contracts[idx] = res.data;
          this.applyContractFilters();
        }
      },
      error: (err) => console.error('Pay error', err),
    });
  }

  cancelContract(contract: ContractResponseDTO): void {
    this.contractService.cancel(contract.id).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.contracts.findIndex(c => c.id === contract.id);
          if (idx !== -1) this.contracts[idx] = res.data;
          this.applyContractFilters();
        }
      },
      error: (err) => console.error('Cancel error', err),
    });
  }

  getContractStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', ACTIVE: 'badge-open',
      ACCEPTED: 'badge-approved', PAID: 'badge-approved',
      CANCELLED: 'badge-urgent', EXPIRED: 'badge-closed',
    };
    return map[status] || 'badge-closed';
  }

  // ══════════════════════════════════════════════
  // QUOTATION SECTION
  // ══════════════════════════════════════════════

  loadQuotations(): void {
    this.isLoadingQuotations = true;
    this.quotationApiError = '';
    this.quotationService.getAll().subscribe({
      next: (res) => {
        this.isLoadingQuotations = false;
        if (res.data) {
          this.quotations = res.data;
          this.stats.pendingActions = res.data.filter(q => q.status === 'PENDING').length;
          this.applyQuotationFilters();
        } else {
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

  applyQuotationFilters(): void {
    let data = [...this.quotations];

    if (this.quotationStatusFilter !== 'all') {
      data = data.filter(q => q.status === this.quotationStatusFilter);
    }

    const s = this.quotationSearch.toLowerCase().trim();

    if (s) {
      data = data.filter(q =>
        (q.vehicleType || '').toLowerCase().includes(s)
      );
    }

    this.filteredQuotations = data;
    this.totalQuotations = data.length;
  }


  filterQuotations(): void { this.applyQuotationFilters(); }
  setQuotationFilter(f: string): void { this.quotationStatusFilter = f; this.applyQuotationFilters(); }

  openAddQuotationForm(): void {
    this.quotationForm = EMPTY_QUOTATION_FORM(); this.quotationFormError = '';
    this.showQuotationFormPanel = true; this.scrollTo('quotation-form-section');
  }

  closeQuotationForm(): void { this.showQuotationFormPanel = false; this.quotationFormError = ''; }

  submitQuotation(): void {
    this.quotationFormError = '';
    if (!this.quotationForm.coverageType) { this.quotationFormError = 'Coverage type is required.'; return; }
    this.isSubmittingQuotation = true;
    const dto: QuotationRequestDTO = {
      coverageType: this.quotationForm.coverageType,
      vehicleValue: this.quotationForm.vehicleValue || undefined,
      description: this.quotationForm.description,
    };
    this.quotationService.create(dto, this.currentUserId).subscribe({
      next: (res) => {
        this.isSubmittingQuotation = false;
        if (res.data) {
          this.quotations.unshift(res.data);
          this.applyQuotationFilters();
          this.closeQuotationForm();
        } else {
          this.quotationFormError = res.message || 'Failed to create quotation.';
        }
      },
      error: (err) => {
        this.isSubmittingQuotation = false;
        this.quotationFormError = err?.error?.message || 'Server error.';
      },
    });
  }

  approveQuotation(q: QuotationResponseDTO): void {
    this.quotationService.approve(q.id).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.quotations.findIndex(x => x.id === q.id);
          if (idx !== -1) this.quotations[idx] = res.data;
          this.applyQuotationFilters();
        }
      },
      error: (err) => console.error('Approve error', err),
    });
  }

  rejectQuotation(q: QuotationResponseDTO): void {
    this.quotationService.reject(q.id).subscribe({
      next: (res) => {
        if (res.data) {
          const idx = this.quotations.findIndex(x => x.id === q.id);
          if (idx !== -1) this.quotations[idx] = res.data;
          this.applyQuotationFilters();
        }
      },
      error: (err) => console.error('Reject error', err),
    });
  }

  deleteQuotation(q: QuotationResponseDTO): void {
    this.quotationService.delete(q.id).subscribe({
      next: () => {
        this.quotations = this.quotations.filter(x => x.id !== q.id);
        this.applyQuotationFilters();
      },
      error: (err) => console.error('Delete quotation error', err),
    });
  }

  getQuotationStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-urgent',
    };
    return map[status] || 'badge-closed';
  }

  // ══════════════════════════════════════════════
  // NAV / SECTION OPENERS
  // ══════════════════════════════════════════════

  openUsersSection(): void {
    this.activeRoute = 'users'; this.showUserManagement = true;
    this.openDropdown = ''; this.mobileMenuOpen = false;
    this.scrollTo('users-section');
  }

  openClaimsSection(): void {
    this.activeRoute = 'claims'; this.showClaimManagement = true;
    this.openDropdown = ''; this.mobileMenuOpen = false;
    this.scrollTo('claims-section');
  }

  openContractsSection(): void {
    this.activeRoute = 'contracts'; this.showContractSection = true;
    this.openDropdown = ''; this.mobileMenuOpen = false;
    this.scrollTo('contracts-section');
  }

  openQuotationsSection(): void {
    this.activeRoute = 'quotations'; this.showQuotationSection = true;
    this.openDropdown = ''; this.mobileMenuOpen = false;
    this.scrollTo('quotations-section');
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private scrollTo(id: string): void {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  private loadUserInfo(): void {
    const stored = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || 'CLIENT User';
    this.currentUserId   = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId') || 0);
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.setUser(stored);
  }

  private setUser(fullName: string): void {
    this.userName = fullName;
    const parts   = fullName.trim().split(' ').filter(Boolean);
    this.firstName    = parts[0] || 'User';
    this.lastName     = parts.slice(1).join(' ');
    this.userInitials = ((this.firstName[0] || '') + (this.lastName[0] || '')).toUpperCase() || 'U';
  }

  toggleDropdown(name: string): void { this.openDropdown = this.openDropdown === name ? '' : name; }
  closeAllDropdowns(): void { this.openDropdown = ''; this.mobileMenuOpen = false; }
  toggleMobileMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
  setActive(route: string): void { this.activeRoute = route; }

  isAdmin(): boolean  { return this.currentUserRole === 'ADMIN'; }
  isExpert(): boolean { return this.currentUserRole === 'EXPERT'; }
  isClient(): boolean { return this.currentUserRole === 'CLIENT'; }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllDropdowns();
    if (this.showUserFormPanel)      this.closeUserFormPanel();
    if (this.showClaimFormPanel)     this.closeClaimForm();
    if (this.showQuotationFormPanel) this.closeQuotationForm();
    if (this.showContractFormPanel)  this.closeContractForm();
    if (this.assignTarget)           this.cancelAssign();
    if (this.reportTarget)           this.cancelReport();
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear(); localStorage.clear();
    this.router.navigate(['/login']);
  }

}
