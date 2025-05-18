import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  adminMenuOpen = false;
  userMenuOpen = false;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  
ngOnInit(): void {
  this.authService.user$.subscribe(user => {
    this.user = user;
  });
  
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.adminMenuOpen = false;
      this.userMenuOpen = false;
      this.mobileMenuOpen = false;
    }
  });
}
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigateByUrl('/login');
      }
    });
  }

  toggleAdminMenu(): void {
    this.adminMenuOpen = !this.adminMenuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.adminMenuOpen = false;
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    if (this.mobileMenuOpen) {
      this.adminMenuOpen = false;
      this.userMenuOpen = false;
    }
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
  
  closeMenus(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.adminMenuOpen = false;
      this.userMenuOpen = false;
    }
  }
}