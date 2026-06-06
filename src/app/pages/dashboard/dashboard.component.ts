// dashboard.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { Router, RouterModule }            from '@angular/router';
import { FormsModule }                     from '@angular/forms';
import { AuthService }                     from '../../services/auth.service';
import {
  UserService,
  UserResponseDTO,
  UserRequestDTO,
} from '../../services/user.service';

// ─── Local interfaces ────────────────────────────────────────────────────────

interface Claim {
  vessel: string;
  type: string;
  status: 'open' | 'pending' | 'closed' | 'urgent';
  date: string;
}

interface DashboardStats {
  vessels: number;
  openClaims: number;
  crewAssisted: number;
  pendingActions: number;
}

// ─── Form model (mirrors UserRequestDTO + id for edit mode) ─────────────────

interface UserForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'CLIENT' | 'EXPERT';
}

const EMPTY_FORM = (): UserForm => ({
  fullName: '',
  email: '',
  username: '',
  password: '',
  role: 'CLIENT',
});

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  // ── USER INFO ──────────────────────────────────
  userName     = '';
  firstName    = '';
  lastName     = '';
  userInitials = '';

  // ── NAV STATE ──────────────────────────────────
  activeRoute    = 'dashboard';
  openDropdown   = '';
  mobileMenuOpen = false;

  // ── USER MANAGEMENT VISIBILITY ─────────────────
  showUserManagement = false;

  today = new Date();

  // ── STATS ──────────────────────────────────────
  stats: DashboardStats = {
    vessels: 12, openClaims: 4, crewAssisted: 37, pendingActions: 3,
  };

  // ── CLAIMS ─────────────────────────────────────
  recentClaims: Claim[] = [
    { vessel: 'MV Carthage', type: 'Marine Survey',  status: 'open',    date: '2025-05-02' },
    { vessel: 'MT Hannibal', type: 'Pollution Case', status: 'urgent',  date: '2025-04-29' },
    { vessel: 'MV Utica',    type: 'Legal Assist',   status: 'pending', date: '2025-04-20' },
  ];

  // ── USER MANAGEMENT ────────────────────────────
  users:         UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];

  userSearch = '';
  userFilter: 'all' | 'active' | 'inactive' = 'all';
  totalUsers = 0;

  isLoadingUsers = false;
  apiError       = '';

  // ── DELETE ─────────────────────────────────────
  deleteTarget: UserResponseDTO | null = null;
  isDeleting = false;

  // ── ADD / EDIT FORM PANEL ──────────────────────
  showFormPanel  = false;
  isEditMode     = false;
  editTargetId: number | null = null;
  isSubmitting   = false;
  formError      = '';
  formSuccess    = '';
  form: UserForm = EMPTY_FORM();

  constructor(
    private authService: AuthService,
    private router:      Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadUsers();
  }

  // ══════════════════════════════════════════════
  // USER LOADING (real API)
  // ══════════════════════════════════════════════

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.apiError = '';

    this.userService.getAll().subscribe({
      next: (res) => {

        this.isLoadingUsers = false;

        if (res.data) {

          this.users = res.data.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            status: u.status,

            fullName: u.username,
            createdAt: new Date().toISOString()
          }));

          this.applyUserFilters();

          console.log("Users loaded:", this.users);

        } else {

          this.users = [];
          this.filteredUsers = [];
          this.totalUsers = 0;

          this.apiError = res.message || "Failed to load users.";
        }
      },

      error: (err) => {

        this.isLoadingUsers = false;

        this.users = [];
        this.filteredUsers = [];
        this.totalUsers = 0;

        this.apiError =
          err?.error?.message ||
          (err.status === 403
            ? "Access denied — ADMIN role required."
            : err.status === 0
              ? "Cannot reach server."
              : "Unexpected error.");

        console.error(err);
      }
    });
  }

  applyUserFilters(): void {
    let data = [...this.users];

    if (this.userFilter === 'active') {
      data = data.filter(u => u.status === 'ACTIVE');
    } else if (this.userFilter === 'inactive') {
      data = data.filter(u => u.status === 'INACTIVE');
    }

    const s = this.userSearch.toLowerCase().trim();
    if (s) {
      data = data.filter(u =>
        u.fullName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)    ||
        u.username.toLowerCase().includes(s)
      );
    }

    this.filteredUsers = data;
    this.totalUsers    = data.length;
  }

  filterUsers(): void { this.applyUserFilters(); }

  setUserFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.userFilter = filter;
    this.applyUserFilters();
  }

  // ══════════════════════════════════════════════
  // TOGGLE ACTIVE / INACTIVE (real API)
  // ══════════════════════════════════════════════

  toggleUserStatus(user: UserResponseDTO): void {
    const obs = user.status === 'ACTIVE'
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);

    obs.subscribe({
      next: (res) => {
        if (res.status === 200 || res.status === 201) {
          const idx = this.users.findIndex(u => u.id === user.id);
          if (idx !== -1) {

            this.users[idx] = {
              ...res.data,
              fullName: res.data.username,
              createdAt: this.users[idx].createdAt
            };

          }
          this.applyUserFilters();
        }
      },
      error: (err) => {
        console.error('Toggle status error', err);
      },
    });
  }

  // ══════════════════════════════════════════════
  // DELETE (real API)
  // ══════════════════════════════════════════════

  confirmDelete(user: UserResponseDTO): void { this.deleteTarget = user; }
  cancelDelete(): void  { this.deleteTarget = null; }

  executeDelete(): void {
    const target = this.deleteTarget;
    if (!target) return;
    this.isDeleting = true;

    this.userService.delete(target.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== target.id);
        this.deleteTarget = null;
        this.isDeleting   = false;
        this.applyUserFilters();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Delete error', err);
      },
    });
  }

  // ══════════════════════════════════════════════
  // ADD / EDIT FORM PANEL
  // ══════════════════════════════════════════════

  openAddForm(): void {
    this.isEditMode    = false;
    this.editTargetId  = null;
    this.form          = EMPTY_FORM();
    this.formError     = '';
    this.formSuccess   = '';
    this.showFormPanel = true;
    this.scrollToForm();
  }

  openEditForm(user: UserResponseDTO): void {
    this.isEditMode   = true;
    this.editTargetId = user.id;
    this.form = {
      fullName: user.fullName,
      email:    user.email,
      username: user.username,
      password: '',             // never pre-fill password
      role:     user.role as 'ADMIN' | 'CLIENT' | 'EXPERT',
    };
    this.formError     = '';
    this.formSuccess   = '';
    this.showFormPanel = true;
    this.scrollToForm();
  }

  closeFormPanel(): void {
    this.showFormPanel = false;
    this.formError     = '';
    this.formSuccess   = '';
  }

  private scrollToForm(): void {
    setTimeout(() => {
      document.getElementById('user-form-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  submitForm(): void {
    this.formError   = '';
    this.formSuccess = '';

    // Basic client-side validation
    if (!this.form.fullName.trim()) { this.formError = 'Full name is required.'; return; }
    if (!this.form.email.trim())    { this.formError = 'Email is required.'; return; }
    if (!this.form.username.trim()) { this.formError = 'Username is required.'; return; }
    if (!this.isEditMode && !this.form.password) {
      this.formError = 'Password is required for new users.'; return;
    }

    this.isSubmitting = true;

    const dto: UserRequestDTO = {
      fullName: this.form.fullName.trim(),
      email:    this.form.email.trim(),
      username: this.form.username.trim(),
      role:     this.form.role,
      ...(this.form.password ? { password: this.form.password } : {}),
    };

    const obs = this.isEditMode && this.editTargetId !== null
      ? this.userService.update(this.editTargetId, dto)
      : this.userService.create(dto);

    obs.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.status === 200 && res.data) {
          const idx = this.users.findIndex(u => u.id === this.editTargetId);
          if (idx !== -1) {
            this.users[idx] = {
              ...res.data,
              fullName: res.data.username,
              createdAt: this.users[idx].createdAt
            };
          }
          this.applyUserFilters();
        } else {
          this.formError = res.message || 'Operation failed.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError =
          err?.error?.message ||
          (err.status === 400 ? 'Invalid data. Please check your inputs.' :
            err.status === 409 ? 'Username or email already exists.' :
              'Server error. Please try again.');
      },
    });
  }

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  openUsersSection(): void {
    this.activeRoute       = 'users';
    this.showUserManagement = true;
    this.openDropdown      = '';
    this.mobileMenuOpen    = false;
    setTimeout(() => {
      document.getElementById('users-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ── SESSION ────────────────────────────────────

  private loadUserInfo(): void {
    const stored =
      sessionStorage.getItem('fullName') ||
      localStorage.getItem('fullName')   || 'CLIENT User';
    this.setUser(stored);
  }

  private setUser(fullName: string): void {
    this.userName = fullName;
    const parts   = fullName.trim().split(' ').filter(Boolean);
    this.firstName    = parts[0] || 'User';
    this.lastName     = parts.slice(1).join(' ');
    this.userInitials = (
      (this.firstName[0] || '') + (this.lastName[0] || '')
    ).toUpperCase() || 'U';
  }

  // ── NAV HELPERS ────────────────────────────────

  toggleDropdown(name: string): void {
    this.openDropdown = this.openDropdown === name ? '' : name;
  }

  closeAllDropdowns(): void {
    this.openDropdown  = '';
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }

  setActive(route: string): void { this.activeRoute = route; }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllDropdowns();
    if (this.showFormPanel) this.closeFormPanel();
  }


  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login'])
      .then(success => {console.log('Navigation success:', success);})
      .catch(error => {console.error('Navigation error:', error);});
  }


}
