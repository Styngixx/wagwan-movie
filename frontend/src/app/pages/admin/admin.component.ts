import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseItem, CourseService } from '../../services/course.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="admin-logo">
          <span class="play-icon">▶</span><span>WAGWAN</span>
        </div>
        <nav class="admin-menu">
          <a
            href="javascript:void(0)"
            class="admin-menu-link"
            [class.active]="activeTab() === 'catalogo'"
            (click)="activeTab.set('catalogo')">
            📚 Gestión de Cursos
          </a>
          <a
            href="javascript:void(0)"
            class="admin-menu-link"
            [class.active]="activeTab() === 'banners'"
            (click)="activeTab.set('banners')">
            🖼️ Banners Hero
          </a>
          <a
            href="javascript:void(0)"
            class="admin-menu-link"
            [class.active]="activeTab() === 'tops'"
            (click)="activeTab.set('tops')">
            ⭐ Top Cursos
          </a>
          <a routerLink="/" class="admin-menu-link">🌐 Ver sitio público</a>
        </nav>
        <button type="button" class="admin-logout" (click)="courseService.logout()">Cerrar sesión</button>
      </aside>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="admin-main">
        <header class="admin-header">
          <div>
            <h1>{{ headerTitle() }}</h1>
            <p>{{ headerDesc() }}</p>
          </div>
          <div class="admin-header-right">
            <div class="theme-toggle" (click)="courseService.toggleTheme()" title="Cambiar Tema" style="cursor:pointer; font-size: 1.5rem;">
              {{ courseService.isDarkMode() ? '☀️' : '🌙' }}
            </div>
            <div class="admin-user">
              <span class="admin-avatar">👤</span>
              <span>{{ courseService.currentUser()?.usuario || 'admin' }}</span>
            </div>
          </div>
        </header>

        <!-- ESTADÍSTICAS -->
        <section class="admin-stats">
          <div class="stat-card">
            <span class="stat-title">TOTAL CLASES EN BD</span>
            <strong class="stat-number">{{ courseService.courses().length }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-title">CATEGORÍAS</span>
            <strong class="stat-number">{{ uniqueCategoriesCount() }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-title">LANZAMIENTOS 2026</span>
            <strong class="stat-number">{{ count2026() }}</strong>
          </div>
        </section>

        <!-- PANEL 1: GESTIÓN DE CURSOS -->
        <section class="movies-management admin-panel" [class.active]="activeTab() === 'catalogo'">
          <div class="section-title">
            <div>
              <h2>Cursos y Clases Registradas</h2>
              <p style="color: var(--text-muted); font-size: 13px;">Agrega, edita o elimina contenido educativo.</p>
            </div>
            <button class="btn-add-movie" (click)="openCreateModal()">+ Nueva Clase/Curso</button>
          </div>

          <div class="movies-table-container">
            <table class="movies-table">
              <thead>
                <tr>
                  <th>PORTADA</th>
                  <th>TÍTULO</th>
                  <th>CATEGORÍA</th>
                  <th>AÑO</th>
                  <th>ESTADO BD</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of courseService.courses()">
                  <td>
                    <img [src]="c.imagen" alt="" style="width: 54px; height: 34px; object-fit: cover; border-radius: 6px; background: #fff;">
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">{{ c.titulo }}</div>
                    <span style="font-size: 11px; color: var(--accent-blue); font-weight: 600;">
                      {{ c.tipo === 'serie' ? 'Ruta' : 'Clase' }}
                    </span>
                  </td>
                  <td>{{ c.genero }}</td>
                  <td>{{ c.anio }}</td>
                  <td>
                    <span class="badge" [ngClass]="c.estado === 'activo' ? 'activo' : 'suspendido'">
                      {{ c.estado === 'activo' ? 'ACTIVO' : 'PAUSADO' }}
                    </span>
                  </td>
                  <td style="white-space: nowrap;">
                    <button class="btn-edit-movie" (click)="openEditModal(c)">Editar</button>
                    <button
                      class="btn-edit-movie"
                      style="background: rgba(225, 29, 72, 0.14); color: #f43f5e;"
                      (click)="courseService.toggleCourseStatus(c)">
                      {{ c.estado === 'activo' ? 'Pausar' : 'Activar' }}
                    </button>
                    <button
                      class="btn-delete-movie"
                      style="background: #ef4444; color: #fff;"
                      (click)="courseService.deleteCourse(c.id)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- PANEL 2: BANNERS HERO -->
        <section class="movies-management admin-panel" [class.active]="activeTab() === 'banners'">
          <div class="section-title">
            <div>
              <h2>Cursos en Banner Principal</h2>
              <p style="color: var(--text-muted); font-size: 13px;">Destaca contenidos en el slider inicial.</p>
            </div>
            <button class="btn-add-movie btn-vitrina" (click)="openVitrinaModal('banner')">+ Asignar al Banner</button>
          </div>

          <div class="movies-table-container">
            <table class="movies-table">
              <thead>
                <tr>
                  <th>PORTADA</th>
                  <th>TÍTULO</th>
                  <th>ESTADO BANNER</th>
                  <th>CONTROL BANNER</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of bannerCourses()">
                  <td>
                    <img [src]="c.imagen" alt="" style="width: 54px; height: 34px; object-fit: cover; border-radius: 6px; background: #fff;">
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">{{ c.titulo }}</div>
                    <span style="font-size: 11px; color: var(--accent-blue); font-weight: 600;">
                      {{ c.tipo === 'serie' ? 'Ruta' : 'Clase' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="c.banner_estado">
                      {{ c.banner_estado | uppercase }}
                    </span>
                  </td>
                  <td style="white-space: nowrap;">
                    <button
                      *ngIf="c.banner_estado === 'activo'"
                      class="btn-edit-movie"
                      style="background: #f59e0b; color: #fff;"
                      (click)="courseService.setVitrinaState(c.id, 'banner', 'oculto')">
                      Ocultar
                    </button>
                    <button
                      *ngIf="c.banner_estado === 'oculto'"
                      class="btn-edit-movie"
                      style="background: #10b981; color: #fff;"
                      (click)="courseService.setVitrinaState(c.id, 'banner', 'activo')">
                      Activar
                    </button>
                    <button
                      class="btn-delete-movie"
                      (click)="courseService.setVitrinaState(c.id, 'banner', 'ninguno')">
                      Quitar
                    </button>
                  </td>
                </tr>
                <tr *ngIf="bannerCourses().length === 0">
                  <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 25px;">
                    No hay cursos asignados al Banner. Haz clic en "+ Asignar al Banner".
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- PANEL 3: TOP CURSOS -->
        <section class="movies-management admin-panel" [class.active]="activeTab() === 'tops'">
          <div class="section-title">
            <div>
              <h2>Top Cursos</h2>
              <p style="color: var(--text-muted); font-size: 13px;">Selecciona los cursos más recomendados.</p>
            </div>
            <button class="btn-add-movie btn-vitrina" (click)="openVitrinaModal('top')">+ Asignar al Top</button>
          </div>

          <div class="movies-table-container">
            <table class="movies-table">
              <thead>
                <tr>
                  <th>PORTADA</th>
                  <th>TÍTULO</th>
                  <th>ESTADO TOP</th>
                  <th>CONTROL TOP</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of topCoursesList()">
                  <td>
                    <img [src]="c.imagen" alt="" style="width: 54px; height: 34px; object-fit: cover; border-radius: 6px; background: #fff;">
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">{{ c.titulo }}</div>
                    <span style="font-size: 11px; color: var(--accent-blue); font-weight: 600;">
                      {{ c.tipo === 'serie' ? 'Ruta' : 'Clase' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="c.top_estado">
                      {{ c.top_estado | uppercase }}
                    </span>
                  </td>
                  <td style="white-space: nowrap;">
                    <button
                      *ngIf="c.top_estado === 'activo'"
                      class="btn-edit-movie"
                      style="background: #f59e0b; color: #fff;"
                      (click)="courseService.setVitrinaState(c.id, 'top', 'oculto')">
                      Ocultar
                    </button>
                    <button
                      *ngIf="c.top_estado === 'oculto'"
                      class="btn-edit-movie"
                      style="background: #10b981; color: #fff;"
                      (click)="courseService.setVitrinaState(c.id, 'top', 'activo')">
                      Activar
                    </button>
                    <button
                      class="btn-delete-movie"
                      (click)="courseService.setVitrinaState(c.id, 'top', 'ninguno')">
                      Quitar
                    </button>
                  </td>
                </tr>
                <tr *ngIf="topCoursesList().length === 0">
                  <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 25px;">
                    No hay cursos asignados al Top. Haz clic en "+ Asignar al Top".
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <!-- MODAL DE CREACIÓN / EDICIÓN DE CURSO -->
    <div class="movie-modal" [class.active]="showCourseModal()">
      <div class="movie-modal-content">
        <button class="movie-modal-close" (click)="showCourseModal.set(false)" title="Cerrar">&times;</button>
        <h2>{{ editingCourseId() ? 'Editar contenido en BD' : 'Agregar contenido a BD' }}</h2>

        <form (ngSubmit)="saveCourse()">
          <div class="movie-form-group">
            <label>Título de la Clase / Curso</label>
            <input type="text" [(ngModel)]="formTitle" name="titulo" placeholder="Ej: Semana 01 - Estructuras de Datos" required>
          </div>

          <div class="movie-form-row">
            <div class="movie-form-group">
              <label>Tipo</label>
              <select [(ngModel)]="formTipo" name="tipo" required>
                <option value="pelicula">Clase / Curso</option>
                <option value="serie">Ruta Completa</option>
              </select>
            </div>
            <div class="movie-form-group">
              <label>Categoría</label>
              <select [(ngModel)]="formGenre" name="genero" required>
                <option value="" disabled>Seleccionar...</option>
                <option value="Programación">Programación</option>
                <option value="Algoritmos">Algoritmos</option>
                <option value="Bases de Datos">Bases de Datos</option>
                <option value="Redes">Redes de Comunicación</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
              </select>
            </div>
          </div>

          <div class="movie-form-row">
            <div class="movie-form-group">
              <label>Año de Publicación</label>
              <input type="number" [(ngModel)]="formYear" name="anio" min="1900" max="2100" placeholder="2026" required>
            </div>
            <div class="movie-form-group">
              <label>Duración estimada (min)</label>
              <input type="number" [(ngModel)]="formDuration" name="duracion" placeholder="Ej: 90" required>
            </div>
          </div>

          <div class="movie-form-group">
            <label>Valoración (1 al 10)</label>
            <input type="number" [(ngModel)]="formRanking" name="ranking" min="1" max="10" placeholder="Ej: 9" required>
          </div>

          <div class="movie-form-group">
            <label>Resumen de la Clase (Sinopsis)</label>
            <textarea [(ngModel)]="formSinopsis" name="sinopsis" rows="3" placeholder="Escribe los temas que se tratarán en esta sesión..."></textarea>
          </div>

          <div class="movie-form-group">
            <label>URL de YouTube (Video de la clase)</label>
            <input type="url" [(ngModel)]="formYoutube" name="url_yt" placeholder="https://www.youtube.com/watch?v=...">
          </div>

          <div class="movie-form-group">
            <label>Material Diapositivas / Guía (PDF, PPT, PPTX, DOCX)</label>
            <input type="file" (change)="onDocSelected($event)" accept=".pdf,.doc,.docx,.ppt,.pptx">
          </div>

          <div class="movie-form-group">
            <label>Imagen de Portada</label>
            <input type="file" (change)="onImageSelected($event)" accept="image/*">
          </div>

          <p class="movie-form-error">{{ formError() }}</p>
          <button type="submit" class="movie-save-button">Guardar Cambios</button>
        </form>
      </div>
    </div>

    <!-- MODAL BUSCADOR DE VITRINAS (Asignar a Banner / Asignar a Top Cursos) -->
    <div class="movie-modal" [class.active]="showVitrinaModal()">
      <div class="movie-modal-content" style="max-width: 600px;">
        <button class="movie-modal-close" (click)="showVitrinaModal.set(false)" title="Cerrar">&times;</button>
        <h2>{{ vitrinaTipo() === 'banner' ? 'Asignar a Banner' : 'Asignar a Top Cursos' }}</h2>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 15px;">
          Selecciona la clase que aparecerá en esta vitrina.
        </p>
        <input
          type="text"
          id="vitrinaSearch"
          [ngModel]="vitrinaQuery()"
          (ngModelChange)="vitrinaQuery.set($event)"
          placeholder="Escribe el título...">

        <div id="vitrinaResults" style="max-height: 350px; overflow-y: auto; margin-top: 15px;">
          <div class="search-result-item" *ngFor="let item of availableForVitrina()">
            <div style="display: flex; align-items: center; gap: 14px;">
              <img [src]="item.imagen" alt="" style="width: 58px; height: 38px; object-fit: cover; border-radius: 6px; background: #fff;">
              <div>
                <div style="font-weight: 700; font-size: 15px; color: var(--text-main);">{{ item.titulo }}</div>
                <div style="font-size: 12px; color: var(--text-muted);">{{ item.anio }} | ⭐ {{ item.ranking }}</div>
              </div>
            </div>
            <button
              type="button"
              class="btn-success"
              (click)="assignToVitrina(item.id)">
              Añadir
            </button>
          </div>
          <p *ngIf="availableForVitrina().length === 0" style="text-align: center; color: var(--text-muted); padding: 20px;">
            No hay más cursos disponibles para asignar.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  courseService = inject(CourseService);

  activeTab = signal<'catalogo' | 'banners' | 'tops'>('catalogo');
  showCourseModal = signal(false);
  editingCourseId = signal<string | null>(null);
  formError = signal('');

  showVitrinaModal = signal(false);
  vitrinaTipo = signal<'banner' | 'top'>('banner');
  vitrinaQuery = signal('');

  // Campos del formulario CRUD
  formTitle = '';
  formTipo: 'pelicula' | 'serie' = 'pelicula';
  formGenre = '';
  formYear = 2026;
  formDuration = 90;
  formRanking = 9;
  formSinopsis = '';
  formYoutube = '';
  selectedImage?: File;
  selectedDoc?: File;

  headerTitle = computed(() => {
    if (this.activeTab() === 'banners') return 'Banners Hero';
    if (this.activeTab() === 'tops') return 'Top Cursos';
    return 'Gestión de Cursos';
  });

  headerDesc = computed(() => {
    if (this.activeTab() === 'banners') return 'Elige qué contenido mostrar en la portada principal.';
    if (this.activeTab() === 'tops') return 'Configura el ranking de clases recomendadas.';
    return 'Administra los cursos, materiales didácticos y clases en video.';
  });

  uniqueCategoriesCount = computed(() => {
    const cats = new Set(this.courseService.courses().map(c => c.genero));
    return cats.size;
  });

  count2026 = computed(() =>
    this.courseService.courses().filter(c => Number(c.anio) === 2026).length
  );

  bannerCourses = computed(() =>
    this.courseService.courses().filter(c => c.banner_estado !== 'ninguno')
  );

  topCoursesList = computed(() =>
    this.courseService.courses().filter(c => c.top_estado !== 'ninguno')
  );

  availableForVitrina = computed(() => {
    const q = this.vitrinaQuery().trim().toLowerCase();
    const tipo = this.vitrinaTipo();
    return this.courseService.courses().filter(c => {
      const notAssigned = tipo === 'banner' ? c.banner_estado === 'ninguno' : c.top_estado === 'ninguno';
      const matchesQuery = !q || c.titulo.toLowerCase().includes(q) || c.genero.toLowerCase().includes(q);
      return notAssigned && matchesQuery;
    });
  });

  ngOnInit(): void {
    this.courseService.loadCourses().subscribe();
  }

  openCreateModal(): void {
    this.editingCourseId.set(null);
    this.formTitle = '';
    this.formTipo = 'pelicula';
    this.formGenre = '';
    this.formYear = 2026;
    this.formDuration = 90;
    this.formRanking = 9;
    this.formSinopsis = '';
    this.formYoutube = '';
    this.selectedImage = undefined;
    this.selectedDoc = undefined;
    this.formError.set('');
    this.showCourseModal.set(true);
  }

  openEditModal(course: CourseItem): void {
    this.editingCourseId.set(course.id);
    this.formTitle = course.titulo;
    this.formTipo = course.tipo;
    this.formGenre = course.genero;
    this.formYear = course.anio;
    this.formDuration = course.duracion;
    this.formRanking = course.ranking;
    this.formSinopsis = course.sinopsis;
    this.formYoutube = course.url_yt;
    this.selectedImage = undefined;
    this.selectedDoc = undefined;
    this.formError.set('');
    this.showCourseModal.set(true);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedImage = input.files[0];
  }

  onDocSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedDoc = input.files[0];
  }

  saveCourse(): void {
    if (!this.formTitle.trim() || !this.formGenre) {
      this.formError.set('Completa el título y la categoría.');
      return;
    }

    const fd = new FormData();
    fd.append('titulo', this.formTitle);
    fd.append('tipo', this.formTipo);
    fd.append('genero', this.formGenre);
    fd.append('anio', String(this.formYear));
    fd.append('duracion', String(this.formDuration));
    fd.append('ranking', String(this.formRanking));
    fd.append('sinopsis', this.formSinopsis);
    fd.append('url_yt', this.formYoutube);
    if (this.selectedImage) fd.append('imagen', this.selectedImage);
    if (this.selectedDoc) fd.append('documento', this.selectedDoc);

    const editId = this.editingCourseId();
    const request$ = editId
      ? this.courseService.updateCourse(editId, fd)
      : this.courseService.createCourse(fd);

    request$.subscribe({
      next: () => {
        this.showCourseModal.set(false);
      },
      error: (err) => {
        this.formError.set(err?.error?.message || 'Error al guardar en el servidor.');
      }
    });
  }

  openVitrinaModal(tipo: 'banner' | 'top'): void {
    this.vitrinaTipo.set(tipo);
    this.vitrinaQuery.set('');
    this.showVitrinaModal.set(true);
  }

  assignToVitrina(id: string): void {
    this.courseService.setVitrinaState(id, this.vitrinaTipo(), 'activo');
    this.showVitrinaModal.set(false);
  }
}