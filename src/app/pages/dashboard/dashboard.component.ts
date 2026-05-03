// dashboard.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe }          from '@angular/common';
import { Router, RouterModule }            from '@angular/router';
import { AuthService }                     from '../../services/auth.service';

interface Claim {
  vessel: string;
  type:   string;
  status: 'open' | 'pending' | 'closed' | 'urgent';
  date:   string;
}

interface DashboardStats {
  vessels:        number;
  openClaims:     number;
  crewAssisted:   number;
  pendingActions: number;
}

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl:    './dashboard.component.css',
})
export class DashboardComponent implements OnInit {

  // ── User info ─────────────────────────────────────
  userName     = '';
  firstName    = '';
  userInitials = '';

  // ── Nav state ─────────────────────────────────────
  activeRoute    = 'dashboard';
  openDropdown   = '';          // 'services' | 'user' | ''
  mobileMenuOpen = false;

  // ── Page data ─────────────────────────────────────
  today = new Date();

  stats: DashboardStats = {
    vessels:        12,
    openClaims:      4,
    crewAssisted:   37,
    pendingActions:  3,
  };

  recentClaims: Claim[] = [
    { vessel: 'MV Carthage',     type: 'Marine Survey',     status: 'open',    date: 'May 2, 2025'   },
    { vessel: 'MT Hannibal',     type: 'Pollution Case',    status: 'urgent',  date: 'Apr 29, 2025'  },
    { vessel: 'MV Bizerte',      type: 'Customs Fine',      status: 'pending', date: 'Apr 27, 2025'  },
    { vessel: 'MV Sfax Star',    type: 'Legal Assistance',  status: 'closed',  date: 'Apr 21, 2025'  },
    { vessel: 'MV Djerba Ferry', type: 'Medical Assistance',status: 'open',    date: 'Apr 18, 2025'  },
  ];

  constructor(
    private authService: AuthService,
    private router:      Router,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.activeRoute = 'dashboard';
  }

  // ── Helpers ───────────────────────────────────────

  private loadUserInfo(): void {
    // Pull stored name or fall back to a placeholder.
    // Adjust to however your AuthService exposes the current user.
    const stored = sessionStorage.getItem('userName') ?? localStorage.getItem('userName');
    this.userName     = stored ?? 'Partner User';
    this.firstName    = this.userName.split(' ')[0];
    this.userInitials = this.userName
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  // ── Nav interactions ──────────────────────────────

  toggleDropdown(name: string): void {
    this.openDropdown = this.openDropdown === name ? '' : name;
  }

  closeAllDropdowns(): void {
    this.openDropdown   = '';
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.openDropdown   = '';
  }

  /** Close dropdowns when clicking outside the nav. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllDropdowns();
  }

  // ── Auth ──────────────────────────────────────────

  logout(): void {
    this.authService.logout?.();          // call only if the method exists
    sessionStorage.clear();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
