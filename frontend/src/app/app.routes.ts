import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DetalleComponent } from './pages/detalle/detalle.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CourseService } from './services/course.service';

export const adminGuard: CanActivateFn = () => {
  const courseService = inject(CourseService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (courseService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'detalle/:id', component: DetalleComponent },
  { path: 'favoritos', component: FavoritosComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];