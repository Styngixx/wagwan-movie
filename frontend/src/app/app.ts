import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CourseService } from './services/course.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html'
})
export class App {
  courseService = inject(CourseService);
  private router = inject(Router);

  mobileOpen = signal(false);
  authModalOpen = signal(false);
  authMode = signal<'login' | 'register'>('login');
  authError = signal('');
  searchQuery = signal('');
  isAdminRoute = signal(false);

  authUsuario = '';
  authPassword = '';

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      });
  }

  searchResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.courseService.courses().filter(c =>
      c.titulo.toLowerCase().includes(q) || c.genero.toLowerCase().includes(q)
    );
  });

  openAuth(mode: 'login' | 'register'): void {
    this.authMode.set(mode);
    this.authError.set('');
    this.authModalOpen.set(true);
  }

  submitAuth(): void {
    if (!this.authUsuario.trim() || !this.authPassword.trim()) return;
    this.authError.set('');
    this.courseService.loginOrRegister(this.authMode(), this.authUsuario, this.authPassword).subscribe({
      next: () => {
        this.authModalOpen.set(false);
        this.authUsuario = '';
        this.authPassword = '';
      },
      error: (err) => {
        this.authError.set(err?.error?.message || err?.error?.error || 'Credenciales incorrectas.');
      }
    });
  }
}