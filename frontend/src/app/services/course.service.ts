import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type VitrinaEstado = 'activo' | 'oculto' | 'ninguno';

export interface CourseItem {
  id: string;
  titulo: string;
  tipo: 'pelicula' | 'serie';
  genero: string;
  anio: number;
  duracion: number;
  ranking: number;
  sinopsis: string;
  url_yt: string;
  documento_url?: string;
  imagen: string;
  estado: 'activo' | 'suspendido';
  banner_estado: VitrinaEstado;
  top_estado: VitrinaEstado;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = `${environment.apiUrl}/peliculas`;
  private authUrl = `${environment.apiUrl}/auth`;

  isDarkMode = signal<boolean>(true);
  favorites = signal<string[]>([]);
  currentUser = signal<{ usuario: string; rol: string } | null>(null);
  courses = signal<CourseItem[]>([]);

  // Solo es true si inició sesión con rol/usuario administrador
  isAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    const role = (user.rol || '').toLowerCase();
    const name = (user.usuario || '').toLowerCase();
    return role === 'admin' || role === 'administrador' || name === 'admin';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedFavs = localStorage.getItem('wagwanFavorites');
      if (savedFavs) this.favorites.set(JSON.parse(savedFavs));

      const savedUser = localStorage.getItem('wagwanUser');
      if (savedUser) this.currentUser.set(JSON.parse(savedUser));

      const savedTheme = localStorage.getItem('wagwanTheme');
      if (savedTheme === 'light') {
        this.isDarkMode.set(false);
        document.body.classList.remove('dark-mode');
      }
    }
  }

  private resolveAssetUrl(path?: string): string {
    if (!path) {
      return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';
    }
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return `${environment.serverUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private extractImageFromRow(r: any): string {
    const knownKeys = [
      'imagen', 'caratula', 'imagen_url', 'url_imagen', 'portada',
      'poster', 'img', 'foto', 'cover', 'thumbnail', 'banner_img'
    ];
    for (const key of knownKeys) {
      if (typeof r[key] === 'string' && r[key].trim().length > 0) {
        return this.resolveAssetUrl(r[key].trim());
      }
    }
    for (const [key, val] of Object.entries(r)) {
      if (typeof val === 'string' && !key.includes('yt') && !key.includes('doc') && !key.includes('pdf')) {
        const lower = val.toLowerCase();
        if (
          lower.includes('/media/') ||
          /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/.test(lower)
        ) {
          return this.resolveAssetUrl(val.trim());
        }
      }
    }
    return this.resolveAssetUrl();
  }

  private extractYoutubeFromRow(r: any): string {
    const knownKeys = ['url_yt', 'youtube', 'url_youtube', 'video_url', 'video', 'enlace_yt', 'trailer'];
    for (const key of knownKeys) {
      if (typeof r[key] === 'string' && r[key].trim().length > 0) {
        return r[key].trim();
      }
    }
    for (const val of Object.values(r)) {
      if (typeof val === 'string' && (val.includes('youtube.com') || val.includes('youtu.be'))) {
        return val.trim();
      }
    }
    return '';
  }

  private extractDocFromRow(r: any): string | undefined {
    const knownKeys = [
      'documento_url', 'documento', 'archivo', 'archivo_url',
      'pdf_url', 'pdf', 'material', 'material_url', 'guia', 'diapositivas'
    ];
    for (const key of knownKeys) {
      if (typeof r[key] === 'string' && r[key].trim().length > 0) {
        return this.resolveAssetUrl(r[key].trim());
      }
    }
    for (const val of Object.values(r)) {
      if (typeof val === 'string' && /\.(pdf|ppt|pptx|doc|docx)(\?.*)?$/i.test(val.trim())) {
        return this.resolveAssetUrl(val.trim());
      }
    }
    return undefined;
  }

  private getLocalOverrides(): Record<string, Partial<CourseItem>> {
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      return JSON.parse(localStorage.getItem('wagwanVitrinaOverrides') || '{}');
    } catch {
      return {};
    }
  }

  private saveLocalOverride(id: string, patch: Partial<CourseItem>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const all = this.getLocalOverrides();
    all[id] = { ...(all[id] || {}), ...patch };
    localStorage.setItem('wagwanVitrinaOverrides', JSON.stringify(all));
  }

  mapRow(r: any, idx = 0): CourseItem {
    const id = String(r.id);
    const override = this.getLocalOverrides()[id] || {};

    let bannerEstado: VitrinaEstado = 'ninguno';
    if (r.estado_banner === 'activo' || r.estado_banner === 'oculto') {
      bannerEstado = r.estado_banner;
    } else if (r.banner === true || r.en_banner === true || r.banner === 'activo') {
      bannerEstado = 'activo';
    } else if (r.banner === 'oculto') {
      bannerEstado = 'oculto';
    } else if (idx === 0) {
      bannerEstado = 'activo';
    }

    let topEstado: VitrinaEstado = 'ninguno';
    if (r.estado_top === 'activo' || r.estado_top === 'oculto') {
      topEstado = r.estado_top;
    } else if (r.top === true || r.en_top === true || r.top === 'activo') {
      topEstado = 'activo';
    } else if (r.top === 'oculto') {
      topEstado = 'oculto';
    } else if (idx < 3) {
      topEstado = 'activo';
    }

    const baseEstado: 'activo' | 'suspendido' =
      r.estado === 'suspendido' || r.estado === 'oculto' || r.estado === 'inactivo'
        ? 'suspendido'
        : 'activo';

    return {
      id,
      titulo: r.titulo || r.title || r.nombre || 'Curso sin título',
      tipo: r.tipo === 'serie' ? 'serie' : 'pelicula',
      genero: r.genero || r.categoria || 'Programación',
      anio: Number(r.anio) || 2026,
      duracion: Number(r.duracion) || 90,
      ranking: Number(r.ranking) || 8,
      sinopsis: r.sinopsis || r.resumen || r.descripcion || r.description || r.contenido || '',
      url_yt: this.extractYoutubeFromRow(r),
      documento_url: this.extractDocFromRow(r),
      imagen: this.extractImageFromRow(r),
      estado: override.estado ?? baseEstado,
      banner_estado: override.banner_estado ?? bannerEstado,
      top_estado: override.top_estado ?? topEstado
    };
  }

  toggleTheme(): void {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-mode', next);
      localStorage.setItem('wagwanTheme', next ? 'dark' : 'light');
    }
  }

  loadCourses(): Observable<CourseItem[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        const rows = Array.isArray(res) ? res : (res?.data || res?.peliculas || []);
        const mapped = rows.map((r: any, i: number) => this.mapRow(r, i));
        this.courses.set(mapped);
        return mapped;
      }),
      catchError(() => of(this.courses()))
    );
  }

  // Trae el curso completo (tanto de memoria como del endpoint /api/peliculas/:id)
  getCourseDetail(id: string): Observable<CourseItem | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        const raw = res?.data || res?.pelicula || res;
        if (!raw || !raw.id) return this.courses().find(c => String(c.id) === String(id));
        const detailed = this.mapRow(raw);
        this.courses.update(list => {
          const exists = list.some(c => String(c.id) === String(detailed.id));
          return exists
            ? list.map(c => (String(c.id) === String(detailed.id) ? { ...c, ...detailed } : c))
            : [...list, detailed];
        });
        return detailed;
      }),
      catchError(() =>
        this.loadCourses().pipe(
          map(list => list.find(c => String(c.id) === String(id)))
        )
      )
    );
  }

  toggleFavorite(id: string): void {
    const current = this.favorites();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    this.favorites.set(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('wagwanFavorites', JSON.stringify(updated));
    }
  }

  isFavorite(id: string): boolean {
    return this.favorites().includes(id);
  }

  createCourse(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData).pipe(
      tap(() => this.loadCourses().subscribe())
    );
  }

  updateCourse(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData).pipe(
      tap(() => this.loadCourses().subscribe()),
      catchError(() => {
        this.loadCourses().subscribe();
        return of(null);
      })
    );
  }

  toggleCourseStatus(course: CourseItem): void {
    const nextEstado: 'activo' | 'suspendido' = course.estado === 'activo' ? 'suspendido' : 'activo';
    this.saveLocalOverride(course.id, { estado: nextEstado });
    this.courses.update(list =>
      list.map(c => (c.id === course.id ? { ...c, estado: nextEstado } : c))
    );
    this.http.put(`${this.apiUrl}/${course.id}`, { estado: nextEstado }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  deleteCourse(id: string): void {
    this.courses.update(list => list.filter(c => c.id !== id));
    this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  setVitrinaState(id: string, tipo: 'banner' | 'top', nuevoEstado: VitrinaEstado): void {
    const patch: Partial<CourseItem> =
      tipo === 'banner' ? { banner_estado: nuevoEstado } : { top_estado: nuevoEstado };

    this.saveLocalOverride(id, patch);
    this.courses.update(list =>
      list.map(c => (c.id === id ? { ...c, ...patch } : c))
    );

    const payload =
      tipo === 'banner'
        ? { estado_banner: nuevoEstado, banner: nuevoEstado === 'activo' }
        : { estado_top: nuevoEstado, top: nuevoEstado === 'activo' };

    this.http.put(`${this.apiUrl}/${id}`, payload).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  loginOrRegister(mode: 'login' | 'register', usuario: string, password: string): Observable<any> {
    const endpoint = mode === 'login' ? `${this.authUrl}/login` : `${this.authUrl}/register`;
    return this.http.post<any>(endpoint, { usuario, email: usuario, password }).pipe(
      tap(res => {
        const backendUser = res?.user || res?.usuarioObj || res;
        const username = backendUser?.usuario || backendUser?.nombre || usuario;
        const detectedRole =
          mode === 'register'
            ? 'student'
            : (backendUser?.rol || (username.toLowerCase() === 'admin' ? 'admin' : 'student'));

        const userObj = { usuario: username, rol: detectedRole };
        this.currentUser.set(userObj);

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('wagwanUser', JSON.stringify(userObj));
          if (res?.token) localStorage.setItem('wagwanToken', res.token);
        }

        // Solo redirige a /admin si realmente tiene rol de administrador
        if (detectedRole === 'admin' || detectedRole === 'administrador') {
          this.router.navigate(['/admin']);
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('wagwanUser');
      localStorage.removeItem('wagwanToken');
    }
    this.router.navigate(['/']);
  }
}