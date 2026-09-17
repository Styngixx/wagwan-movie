document.addEventListener('DOMContentLoaded', () => {

    // === 1. PROTECCIÓN Y SESIÓN (ANTI-CRASH) ===
    const adminLogged = localStorage.getItem('adminLogged');
    if (adminLogged !== 'true') {
        window.location.href = '/'; 
        return; 
    }

    try {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        const nombreAdmin = adminUser.usuario || adminUser.nombre_usr || 'Admin';
        const nameElement = document.getElementById('adminLoggedName');
        if (nameElement) nameElement.textContent = nombreAdmin; 
    } catch (e) { 
        console.error("Error leyendo sesión"); 
    }

    // === 2. TEMA GLOBAL WAGWAN ===
    const body = document.body;
    const adminThemeToggle = document.getElementById('adminThemeToggle');
    
    if (localStorage.getItem('wagwanTheme') === 'dark') {
        body.classList.add('dark-mode');
        if (adminThemeToggle) adminThemeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        if (adminThemeToggle) adminThemeToggle.textContent = '🌙';
    }

    adminThemeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('wagwanTheme', isDark ? 'dark' : 'light');
        if (adminThemeToggle) adminThemeToggle.textContent = isDark ? '☀️' : '🌙';
    });

    // === 3. VARIABLES Y PESTAÑAS ===
    const moviesTableBody = document.getElementById('moviesTableBody');
    const bannerTableBody = document.getElementById('bannerTableBody');
    const topTableBody = document.getElementById('topTableBody');
    let peliculas = [];

    const menuLinks = document.querySelectorAll('.admin-menu-link[data-target]');
    const panels = document.querySelectorAll('.admin-panel');
    const panelTitle = document.getElementById('panelTitle');
    const panelDesc = document.getElementById('panelDesc');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            menuLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(link.dataset.target).classList.add('active');
            
            panelTitle.textContent = link.textContent.replace(/[🎬🖼️⭐]/g, '').trim();
            if(link.dataset.target === 'panel-catalogo') panelDesc.textContent = 'Gestiona la bóveda general de películas y series.';
            if(link.dataset.target === 'panel-banners') panelDesc.textContent = 'Elige qué contenido de la BD mostrar en el inicio.';
            if(link.dataset.target === 'panel-tops') panelDesc.textContent = 'Arma tu cartelera lateral de Top Estrenos.';
        });
    });

    // === 4. CARGAR DATOS Y RENDERIZAR ===
    async function cargarPeliculas() {
        try {
            const response = await fetch('/api/peliculas');
            peliculas = await response.json();
            renderizarTablas();
            actualizarEstadisticas();
        } catch (error) { console.error('Error al cargar bd:', error); }
    }

    function actualizarEstadisticas() {
        const elMovies = document.getElementById('totalMovies');
        if(elMovies) elMovies.textContent = peliculas.length;
        
        const generos = new Set(peliculas.map(p => p.genero));
        const elGenres = document.getElementById('totalGenres');
        if(elGenres) elGenres.textContent = generos.size;
        
        const el2026 = document.getElementById('total2026');
        if(el2026) el2026.textContent = peliculas.filter(p => p.año_estreno == 2026).length;
    }

    function renderizarTablas() {
        moviesTableBody.innerHTML = '';
        bannerTableBody.innerHTML = '';
        topTableBody.innerHTML = '';

        peliculas.forEach(p => {
            const estadoBD = p.estado || 'Activo';
            const estadoBanner = p.estado_banner || 'Ninguno';
            const estadoTop = p.estado_top || 'Ninguno';
            const tipoLabel = p.tipo === 'serie' ? 'Serie' : 'Película';

            moviesTableBody.innerHTML += `
                <tr>
                    <td><img src="${p.url_portada}" width="45" style="border-radius:4px; object-fit:cover;"></td>
                    <td>
                        <strong style="display:block;">${p.titulo}</strong>
                        <span style="font-size:11px; color:var(--accent-blue); font-weight:bold;">${tipoLabel}</span>
                    </td>
                    <td>${p.genero}</td>
                    <td>${p.año_estreno}</td>
                    <td><span class="badge ${estadoBD.toLowerCase()}">${estadoBD}</span></td>
                    <td>
                        <button class="btn-edit-movie" data-action="editar" data-id="${p.id}">Editar</button>
                        ${estadoBD === 'Activo' 
                            ? `<button class="btn-delete-movie" data-action="estadoBD" data-estado="Suspendido" data-id="${p.id}">Suspender</button>` 
                            : `<button class="btn-success" style="padding:7px 12px; border:none; border-radius:7px; cursor:pointer;" data-action="estadoBD" data-estado="Activo" data-id="${p.id}">Activar</button>`}
                    </td>
                </tr>
            `;

            if (estadoBanner !== 'Ninguno') bannerTableBody.innerHTML += crearFilaVitrina(p, 'estado_banner', estadoBanner, tipoLabel);
            if (estadoTop !== 'Ninguno') topTableBody.innerHTML += crearFilaVitrina(p, 'estado_top', estadoTop, tipoLabel);
        });
    }

    function crearFilaVitrina(p, campo, estado, tipoLabel) {
        const isActivo = estado === 'Activo';
        const btnAccion = isActivo 
            ? `<button class="btn-edit-movie" style="background:#f39c12;" data-action="vitrina" data-campo="${campo}" data-estado="Oculto" data-id="${p.id}">Ocultar</button>`
            : `<button class="btn-edit-movie" style="background:#2ecc71;" data-action="vitrina" data-campo="${campo}" data-estado="Activo" data-id="${p.id}">Activar</button>`;

        return `<tr>
            <td><img src="${p.url_portada}" width="45" style="border-radius:4px; object-fit:cover;"></td>
            <td>
                <strong style="display:block;">${p.titulo}</strong>
                <span style="font-size:11px; color:var(--accent-blue); font-weight:bold;">${tipoLabel}</span>
            </td>
            <td><span class="badge ${estado.toLowerCase()}">${estado}</span></td>
            <td>
                ${btnAccion}
                <button class="btn-delete-movie" data-action="vitrina" data-campo="${campo}" data-estado="Ninguno" data-id="${p.id}">Quitar</button>
            </td>
        </tr>`;
    }

    // === 5. EVENTOS DE LOS BOTONES DE LAS TABLAS ===
    function setupDelegation(tbody) {
        if(!tbody) return;
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'editar') editarPelicula(id);
            else if (action === 'estadoBD') cambiarEstadoBD(id, btn.dataset.estado);
            else if (action === 'vitrina') cambiarEstadoVitrina(id, btn.dataset.campo, btn.dataset.estado);
        });
    }

    setupDelegation(moviesTableBody);
    setupDelegation(bannerTableBody);
    setupDelegation(topTableBody);

    async function cambiarEstadoBD(id, nuevoEstado) {
        await fetch(`/api/peliculas/${id}/estado`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        cargarPeliculas();
    }

    async function cambiarEstadoVitrina(id, campo, nuevoEstado) {
        await fetch(`/api/peliculas/${id}/vitrina`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campo, estado: nuevoEstado })
        });
        cargarPeliculas();
    }

    // === 6. BUSCADOR PARA VITRINAS ===
    const vitrinaModal = document.getElementById('vitrinaModal');
    const vitrinaSearch = document.getElementById('vitrinaSearch');
    const vitrinaResults = document.getElementById('vitrinaResults');
    let vitrinaActual = ''; 

    document.querySelectorAll('.btn-vitrina').forEach(btn => {
        btn.addEventListener('click', (e) => {
            vitrinaActual = e.target.dataset.tipo === 'banner' ? 'estado_banner' : 'estado_top';
            document.getElementById('vitrinaTitle').textContent = `Asignar al ${vitrinaActual === 'estado_banner' ? 'Banner' : 'Top Estrenos'}`;
            vitrinaSearch.value = '';
            renderizarBuscador(peliculas); 
            vitrinaModal.classList.add('active');
        });
    });

    document.getElementById('vitrinaModalClose')?.addEventListener('click', () => vitrinaModal.classList.remove('active'));

    vitrinaSearch?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderizarBuscador(peliculas.filter(p => p.titulo.toLowerCase().includes(term)));
    });

    function renderizarBuscador(lista) {
        vitrinaResults.innerHTML = '';
        lista.forEach(p => {
            const estadoActual = vitrinaActual === 'estado_banner' ? p.estado_banner : p.estado_top;
            if (estadoActual && estadoActual !== 'Ninguno') return;
            if (p.estado === 'Suspendido' || p.estado === 'Eliminado') return;

            const tipoLabel = p.tipo === 'serie' ? 'Serie' : 'Película';
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${p.url_portada}" width="40" style="border-radius:4px; object-fit:cover;">
                    <div>
                        <strong style="display:block; font-size:14px; color:var(--text-main);">${p.titulo}</strong>
                        <span style="font-size:12px; color:var(--text-muted);">${p.año_estreno} | ⭐ ${p.ranking || 10} | ${tipoLabel}</span>
                    </div>
                </div>
                <button class="btn-success" style="padding:6px 12px; border-radius:6px; border:none; cursor:pointer;" 
                        data-action="add-vitrina" data-id="${p.id}" data-campo="${vitrinaActual}" data-estado="Activo">
                    Añadir
                </button>
            `;
            vitrinaResults.appendChild(div);
        });
        
        if(vitrinaResults.innerHTML === '') {
            vitrinaResults.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No hay contenido disponible para agregar.</p>';
        }
    }

    vitrinaResults?.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if(!btn || btn.dataset.action !== 'add-vitrina') return;
        cambiarEstadoVitrina(btn.dataset.id, btn.dataset.campo, btn.dataset.estado);
        vitrinaModal.classList.remove('active');
    });

    // === 7. CRUD PRINCIPAL (Formulario) ===
    const movieModal = document.getElementById('movieModal');
    const movieForm = document.getElementById('movieForm');
    let peliculaEditandoId = null;

    document.getElementById('btnAddMovie')?.addEventListener('click', () => {
        peliculaEditandoId = null;
        movieForm.reset();
        document.getElementById('movieTipo').value = 'pelicula'; 
        document.getElementById('movieImage').required = true; 
        document.querySelector('#movieModal h2').textContent = 'Agregar contenido a BD';
        movieModal.classList.add('active');
    });

    document.getElementById('movieModalClose')?.addEventListener('click', () => movieModal.classList.remove('active'));

    function editarPelicula(id) {
        const peli = peliculas.find(p => p.id == id);
        if (peli) {
            peliculaEditandoId = peli.id;
            document.getElementById('movieTitle').value = peli.titulo;
            document.getElementById('movieTipo').value = peli.tipo || 'pelicula'; 
            document.getElementById('movieGenre').value = peli.genero;
            document.getElementById('movieYear').value = peli.año_estreno;
            document.getElementById('movieDuration').value = peli.duracion;
            document.getElementById('movieRanking').value = peli.ranking || 10;
            document.getElementById('movieImage').required = false; 
            document.querySelector('#movieModal h2').textContent = 'Editar contenido';
            movieModal.classList.add('active');
        }
    }

    movieForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('titulo', document.getElementById('movieTitle').value);
        formData.append('tipo', document.getElementById('movieTipo').value); 
        formData.append('genero', document.getElementById('movieGenre').value);
        formData.append('anio', document.getElementById('movieYear').value); 
        formData.append('duracion', document.getElementById('movieDuration').value);
        formData.append('ranking', document.getElementById('movieRanking').value);

        const img = document.getElementById('movieImage').files[0];
        if (img) formData.append('imagen', img);

        const url = peliculaEditandoId ? `/api/peliculas/${peliculaEditandoId}` : '/api/peliculas';
        const method = peliculaEditandoId ? 'PUT' : 'POST';

        document.getElementById('movieFormError').textContent = '⏳ Guardando...';
        
        try {
            const res = await fetch(url, { method, body: formData });
            if (res.ok) {
                movieModal.classList.remove('active');
                cargarPeliculas();
            } else {
                document.getElementById('movieFormError').textContent = 'Error al guardar';
            }
        } catch (e) { document.getElementById('movieFormError').textContent = 'Error de conexión'; }
    });

    document.getElementById('adminLogout')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });

    cargarPeliculas();
});