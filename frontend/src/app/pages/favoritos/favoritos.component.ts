import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="favorites-page">
      <div class="favorites-heading" style="margin-bottom: 30px;">
        <span class="detail-kicker">MI COLECCIÓN</span>
        <h1>Mis Clases Guardadas</h1>
        <p style="color: var(--text-muted);">Encuentra aquí los cursos y sesiones que guardaste para repasar.</p>
      </div>

      <div class="grid-episodios" *ngIf="savedCourses().length > 0; else emptyState">
        <article class="card-ep" *ngFor="let course of savedCourses()">
          <a [routerLink]="['/detalle', course.id]">
            <div class="ep-img" [style.backgroundImage]="'url(' + course.imagen + ')'">
              <span class="ep-badge">★ {{ course.ranking }}</span>
            </div>
          </a>
          <div style="padding: 15px;">
            <span style="font-size: 11px; color: var(--accent-blue); font-weight: 700;">{{ course.genero }}</span>
            <h3 style="font-size: 15px; margin: 6px 0 12px;">{{ course.titulo }}</h3>
            <button type="button" class="btn-primary" style="font-size: 12px; padding: 6px 12px;" (click)="courseService.toggleFavorite(course.id)">
              Quitar de guardados
            </button>
          </div>
        </article>
      </div>

      <ng-template #emptyState>
        <div style="background: var(--card-bg); border: 1px solid var(--border-light); padding: 40px; border-radius: 12px; text-align: center;">
          <p style="color: var(--text-muted); margin-bottom: 15px;">Aún no tienes clases guardadas en tu colección.</p>
          <a routerLink="/" class="btn-primary">Explorar cursos</a>
        </div>
      </ng-template>
    </main>
  `
})
export class FavoritosComponent {
  courseService = inject(CourseService);
  savedCourses = computed(() =>
    this.courseService.courses().filter(c => this.courseService.favorites().includes(c.id))
  );
}