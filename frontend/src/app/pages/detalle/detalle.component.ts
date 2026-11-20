import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseItem, CourseService } from '../../services/course.service';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="course-container" *ngIf="course() as c; else loadingTpl">
      <div style="margin-bottom: 15px;">
        <a routerLink="/" style="color: var(--accent-blue); font-weight: 600; font-size: 14px;">← Volver al catálogo</a>
      </div>

      <div class="course-header">
        <h1 class="course-title">{{ c.titulo }}</h1>
        <div class="course-meta">
          <span>📚 {{ c.genero }}</span>
          <span>📅 {{ c.anio }}</span>
          <span>⏱ {{ c.duracion }} min</span>
          <span>★ {{ c.ranking }}/10</span>
        </div>
      </div>

      <!-- 1. BLOQUE DE RESUMEN (SINOPSIS) -->
      <div class="course-summary">
        <h3 style="margin-top:0; color:var(--text-main); margin-bottom: 10px; font-size: 1.2rem;">Resumen de la Sesión</h3>
        <p style="white-space: pre-line; color: var(--text-muted);">
          {{ c.sinopsis || 'Esta sesión incluye material teórico y práctico del curso.' }}
        </p>
      </div>

      <!-- 2. VISOR DE DOCUMENTOS ESTILO CANVAS/UTP -->
      <div *ngIf="safeDocUrl() as docUrl" style="background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-light); overflow: hidden; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: var(--bg-secondary); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light);">
          <div style="font-size: 13px; color: var(--text-main); font-weight: 500;">
            Material de Clase • Documento / Diapositivas •
            <span style="background: #d1fae5; color: #065f46; font-size: 11px; padding: 3px 8px; border-radius: 12px; font-weight: bold;">✔ Revisado</span>
          </div>
        </div>
        <div style="position: relative; width: 100%; height: 560px; background: #525659;">
          <iframe [src]="docUrl" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
        </div>
        <div style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background: var(--card-bg); border-top: 1px solid var(--border-light); flex-wrap: wrap; gap: 10px;">
          <span style="font-size: 12px; color: var(--text-muted);">Este material cuenta con 1 archivo online. Recuerda que puedes visualizarlo o descargarlo.</span>
          <div style="display: flex; gap: 10px;">
            <a [href]="c.documento_url" target="_blank" class="btn-primary" style="background: transparent; color: var(--accent-blue); border: 1px solid var(--accent-blue); padding: 6px 14px; font-size: 13px; border-radius: 6px;">↗ Ver en línea</a>
            <a [href]="c.documento_url" target="_blank" download class="btn-primary" style="padding: 6px 14px; font-size: 13px; border-radius: 6px;">📥 Descargar archivo</a>
          </div>
        </div>
      </div>

      <!-- 3. VIDEO EXPLICATIVO (YOUTUBE) -->
      <div style="margin-top: 30px;" *ngIf="safeVideoUrl() as videoUrl">
        <h3 style="margin-bottom: 15px; color: var(--text-main); font-size: 1.2rem;">Clase en Video</h3>
        <div class="video-container">
          <iframe [src]="videoUrl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </main>

    <ng-template #loadingTpl>
      <main class="course-container" style="text-align: center; padding: 60px 20px;">
        <p style="color: var(--text-muted);">Cargando información de la clase...</p>
      </main>
    </ng-template>
  `
})
export class DetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  courseService = inject(CourseService);

  course = signal<CourseItem | undefined>(undefined);

  safeVideoUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.course()?.url_yt || '';
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  });

  safeDocUrl = computed<SafeResourceUrl | null>(() => {
    const doc = this.course()?.documento_url || '';
    if (!doc) return null;
    const isOffice = /\.(ppt|pptx|doc|docx)(\?.*)?$/i.test(doc);
    const viewerUrl = isOffice
      ? `https://docs.google.com/gview?url=${encodeURIComponent(doc)}&embedded=true`
      : doc;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '1';
      const cached = this.courseService.courses().find(c => String(c.id) === String(id));
      if (cached) this.course.set(cached);

      this.courseService.getCourseDetail(id).subscribe(fullCourse => {
        if (fullCourse) this.course.set(fullCourse);
      });
    });
  }
}