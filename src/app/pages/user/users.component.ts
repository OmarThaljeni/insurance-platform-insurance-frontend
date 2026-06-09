// users.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { RouterModule }                    from '@angular/router';
import { FormsModule }                     from '@angular/forms';
import {
  UserService,
  UserResponseDTO,
  UserRequestDTO,
} from '../../services/user.service';

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

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {

  currentUserRole = '';

  users:         UserResponseDTO[] = [];
  filteredUsers: UserResponseDTO[] = [];
  userSearch  = '';
  userFilter: 'all' | 'active' | 'inactive' = 'all';
  totalUsers  = 0;
  isLoadingUsers = false;
  apiError    = '';

  deleteTarget: UserResponseDTO | null = null;
  isDeleting  = false;

  showUserFormPanel  = false;
  isEditUserMode     = false;
  editUserTargetId: number | null = null;
  isSubmittingUser   = false;
  userFormError      = '';
  userFormSuccess    = '';
  userForm: UserForm = EMPTY_USER_FORM();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.loadUsers();
  }

  isAdmin(): boolean { return this.currentUserRole === 'ADMIN'; }

  // ── Load ─────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.apiError = '';
    this.userService.getAll().subscribe({
      next: (res) => {
        this.isLoadingUsers = false;
        if (res.data) {
          this.users = res.data.map(u => ({ ...u, fullName: u.username, createdAt: new Date().toISOString() }));
          this.applyFilters();
        } else {
          this.users = []; this.filteredUsers = []; this.totalUsers = 0;
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

  applyFilters(): void {
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

  filterUsers(): void               { this.applyFilters(); }
  setUserFilter(f: 'all' | 'active' | 'inactive'): void { this.userFilter = f; this.applyFilters(); }

  // ── Toggle status ─────────────────────────────────────────────────────────

  toggleUserStatus(user: UserResponseDTO): void {
    const obs = user.status === 'ACTIVE'
      ? this.userService.deactivate(user.id)
      : this.userService.activate(user.id);
    obs.subscribe({
      next: (res) => {
        if (res.status === 200 || res.status === 201) {
          const idx = this.users.findIndex(u => u.id === user.id);
          if (idx !== -1)
            this.users[idx] = { ...res.data, fullName: res.data.username, createdAt: this.users[idx].createdAt };
          this.applyFilters();
        }
      },
      error: (err) => console.error('Toggle status error', err),
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDelete(user: UserResponseDTO): void { this.deleteTarget = user; }
  cancelDelete(): void                        { this.deleteTarget = null; }

  executeDelete(): void {
    const target = this.deleteTarget;
    if (!target) return;
    this.isDeleting = true;
    this.userService.delete(target.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== target.id);
        this.deleteTarget = null; this.isDeleting = false;
        this.applyFilters();
      },
      error: (err) => { this.isDeleting = false; console.error('Delete error', err); },
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  openAddUserForm(): void {
    this.isEditUserMode = false; this.editUserTargetId = null;
    this.userForm = EMPTY_USER_FORM(); this.userFormError = ''; this.userFormSuccess = '';
    this.showUserFormPanel = true;
    this.scrollTo('user-form-section');
  }

  openEditUserForm(user: UserResponseDTO): void {
    this.isEditUserMode = true; this.editUserTargetId = user.id;
    this.userForm = { fullName: user.fullName, email: user.email, username: user.username, password: '', role: user.role as any };
    this.userFormError = ''; this.userFormSuccess = '';
    this.showUserFormPanel = true;
    this.scrollTo('user-form-section');
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
            if (idx !== -1)
              this.users[idx] = { ...res.data, fullName: res.data.username, createdAt: this.users[idx].createdAt };
          } else {
            this.users.unshift({ ...res.data, fullName: res.data.username, createdAt: new Date().toISOString() });
          }
          this.applyFilters();
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private scrollTo(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showUserFormPanel) this.closeUserFormPanel();
    if (this.deleteTarget)      this.cancelDelete();
  }
}
