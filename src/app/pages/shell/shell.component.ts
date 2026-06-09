// shell.component.ts  — persistent top-nav wrapper for all dashboard routes
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService }                     from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements OnInit {

  userName     = '';
  firstName    = '';
  userInitials = '';
  currentUserRole = 'CLIENT';

  openDropdown   = '';
  mobileMenuOpen = false;
  today          = new Date();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || 'User';
    this.currentUserRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'CLIENT';
    this.setUser(stored);
  }

  private setUser(fullName: string): void {
    this.userName = fullName;
    const parts   = fullName.trim().split(' ').filter(Boolean);
    const first   = parts[0] || 'U';
    const last    = parts.slice(1).join(' ');
    this.firstName    = first;
    this.userInitials = ((first[0] || '') + (last[0] || '')).toUpperCase() || 'U';
  }

  isAdmin():  boolean { return this.currentUserRole === 'ADMIN'; }
  isExpert(): boolean { return this.currentUserRole === 'EXPERT'; }
  isClient(): boolean { return this.currentUserRole === 'CLIENT'; }

  toggleDropdown(name: string): void { this.openDropdown = this.openDropdown === name ? '' : name; }
  closeAllDropdowns(): void { this.openDropdown = ''; this.mobileMenuOpen = false; }
  toggleMobileMenu(): void  { this.mobileMenuOpen = !this.mobileMenuOpen; }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeAllDropdowns(); }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear(); localStorage.clear();
    this.router.navigate(['/login']);
  }
}
