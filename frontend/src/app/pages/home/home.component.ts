import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO BANNER (Carrusel Automático con Banners Activos) -->
    <section
      class="hero-banner"
      *ngIf="currentHero() as hero"
      [style.backgroundImage]="'var(--hero-overlay), url(' + hero.imagen + ')'">
      <div class="hero-content">
        <h1>{{ hero.titulo }}</h1>
        <div class="meta-info">
          <span class="rating">★ {{ hero.ranking }}/10</span>
          <span>{{ hero.anio }}</span>
          <span>{{ hero.genero }}</span>
          <span class="quality">HD</span>
        </div>
        <a [routerLink]="['/detalle', hero.id]" class="btn-primary">▶ Ver Clase</a>
      </div>
    </section>

    <!-- CONTENEDOR PRINCIPAL -->
    <div class="layout-container">
      <main class="main-content">
        <section class="section-block">
          <div class="section-header-row">
            <h2>Cursos destacados</h2>
            <span class="catalog-subtitle">Explora clases actualizadas y material descargable</span>
          </div>

          <div class="movie-filters">
            <button
              *ngFor="let cat of categories"
              class="movie-filter"
              [class.active]="selectedCategory() === cat"
              (click)="selectedCategory.set(cat)">
              {{ cat === 'Todas' ? 'Todos' : cat }}
            </button>
          </div>

          <div class="grid-episodios" id="movies-container">
            <article class="card-ep" *ngFor="let course of filteredCourses()">
              <a [routerLink]="['/detalle', course.id]">
                <div class="ep-img" [style.backgroundImage]="'url(' + course.imagen + ')'">
                  <span class="ep-badge">★ {{ course.ranking }}/10</span>
                </div>
              </a>
              <div style="padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
                <a [routerLink]="['/detalle', course.id]">
                  <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); line-height: 1.3;">
                    {{ course.titulo }}
                  </h3>
                </a>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); margin-top: auto;">
                  <span>📅 {{ course.anio }} | 📚 {{ course.genero }}</span>
                  <button
                    type="button"
                    (click)="courseService.toggleFavorite(course.id)"
                    style="background: transparent; border: none; cursor: pointer; font-size: 15px;"
                    [title]="courseService.isFavorite(course.id) ? 'Quitar de guardados' : 'Guardar clase'">
                    {{ courseService.isFavorite(course.id) ? '❤️' : '🤍' }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <!-- SIDEBAR: TOP CURSOS -->
      <aside class="sidebar">
        <div class="sidebar-header">🔥 TOP CURSOS</div>
        <div class="top-list">
          <a
            class="top-item"
            *ngFor="let top of topCourses(); let i = index"
            [routerLink]="['/detalle', top.id]">
            <div class="top-img" [style.backgroundImage]="'url(' + top.imagen + ')'">
              <span class="rank">#{{ i + 1 }}</span>
            </div>
            <div class="top-info">
              <h4>{{ top.titulo }}</h4>
              <span class="top-meta">{{ top.tipo === 'serie' ? 'Ruta' : 'Clase' }} • ★ {{ top.ranking }}</span>
              <span class="top-year">{{ top.anio }}</span>
            </div>
          </a>
        </div>
      </aside>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  courseService = inject(CourseService);
  private platformId = inject(PLATFORM_ID);

  categories = ['Todas', 'Programación', 'Algoritmos', 'Bases de Datos', 'Redes'];
  selectedCategory = signal('Todas');
  heroIndex = signal(0);
  private intervalId: any;

  activeCourses = computed(() =>
    this.courseService.courses().filter(c => c.estado === 'activo')
  );

  activeBanners = computed(() => {
    const banners = this.activeCourses().filter(c => c.banner_estado === 'activo');
    return banners.length > 0 ? banners : this.activeCourses().slice(0, 1);
  });

  currentHero = computed(() => {
    const list = this.activeBanners();
    if (list.length === 0) return undefined;
    return list[this.heroIndex() % list.length];
  });

  topCourses = computed(() => {
    const tops = this.activeCourses().filter(c => c.top_estado === 'activo');
    return tops.length > 0 ? tops : this.activeCourses().slice(0, 3);
  });

  filteredCourses = computed(() => {
    const cat = this.selectedCategory();
    const list = this.activeCourses();
    if (cat === 'Todas') return list;
    return list.filter(c => c.genero.toLowerCase().includes(cat.toLowerCase()));
  });

  ngOnInit(): void {
    this.courseService.loadCourses().subscribe();
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        const count = this.activeBanners().length;
        if (count > 1) {
          this.heroIndex.update(idx => (idx + 1) % count);
        }
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}