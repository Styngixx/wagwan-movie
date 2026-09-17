document.addEventListener('DOMContentLoaded', () => {

    const adminLogged = localStorage.getItem('adminLogged');
    if (adminLogged !== 'true') return window.location.href = '/';

    // Cargar Usuario
    try {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (adminUser && adminUser.nombre_usr) document.getElementById('adminLoggedName').textContent = adminUser.nombre_usr; 
    } catch (e) { }

    // Theme Toggle
    const body = document.body;
    if (localStorage.getItem('adminTheme') === 'light') body.classList.add('light-mode');
    document.getElementById('adminThemeToggle')?.addEventListener('click', (e) => {
        body.classList.toggle('light-mode');
        localStorage.setItem('adminTheme', body.classList.contains('light-mode') ? 'light' : 'dark');
        e.target.textContent = body.classList.contains('light-mode') ? '🌙' : '☀️';
    });

    const moviesTableBody = document.getElementById('moviesTableBody');
    const movieModal = document.getElementById('movieModal');
    const movieForm = document.getElementById('movieForm');
    
    // Variables de estadísticas
    const totalMovies = document.getElementById('totalMovies');
    const totalGenres = document.getElementById('totalGenres');
    const total2026 = document.getElementById('total2026');

    let peliculas = [];
    let peliculaEditandoId = null;

    // 1. CARGAR DATOS
    async function cargarPeliculas() {
        try {
            const response = await fetch('/api/peliculas');
            peliculas = await response.json();
            mostrarPeliculas(peliculas);
        } catch (error) { console.error('Error al cargar:', error); }
    }

    // ACTUALIZAR ESTADÍSTICAS DEL PANEL
    function actualizarEstadisticas(lista) {
        if (totalMovies) totalMovies.textContent = lista.length;
        const generos = new Set(lista.map(p => p.genero));
        if (totalGenres) totalGenres.textContent = generos.size;
        const estrenos = lista.filter(p => p.año_estreno == 2026);
        if (total2026) total2026.textContent = estrenos.length;
    }

    // 2. RENDERIZAR TABLA
    function mostrarPeliculas(lista) {
        moviesTableBody.innerHTML = '';
        actualizarEstadisticas(lista); // Refresca los contadores de arriba

        lista.forEach(pelicula => {
            const estadoActual = pelicula.estado || 'Activo';
            const badgeClass = estadoActual.toLowerCase();
            
            // Lógica de botones de estado
            const btnStatus = estadoActual === 'Activo' 
                ? `<button class="btn-status-movie btn-warning" data-id="${pelicula.id}" data-estado="Suspendido">Stand By</button>`
                : `<button class="btn-status-movie btn-success" data-id="${pelicula.id}" data-estado="Activo">Activar</button>`;

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><img src="${pelicula.url_portada}" width="50" style="border-radius:6px; object-fit:cover;"></td>
                <td>${pelicula.titulo}</td>
                <td>${pelicula.genero}</td>
                <td>${pelicula.año_estreno || 'N/A'}</td>
                <td><span class="badge ${badgeClass}">${estadoActual}</span></td>
                <td>
                    <button class="btn-edit-movie" data-id="${pelicula.id}">Editar</button>
                    ${estadoActual !== 'Eliminado' ? btnStatus : ''}
                    <button class="btn-delete-movie" data-id="${pelicula.id}">Eliminar</button>
                </td>
            `;
            moviesTableBody.appendChild(fila);
        });
    }

    // 3. ABRIR MODAL (CREAR)
    document.getElementById('btnAddMovie')?.addEventListener('click', () => {
        peliculaEditandoId = null;
        movieForm.reset();
        document.getElementById('movieImage').required = true; 
        document.querySelector('.movie-modal-content h2').textContent = 'Agregar película';
        movieModal.classList.add('active');
    });
    document.getElementById('movieModalClose')?.addEventListener('click', () => movieModal.classList.remove('active'));

    // 4. DELEGACIÓN DE ACCIONES (EDITAR, ESTADO, ELIMINAR)
    moviesTableBody.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        // EDITAR
        if (e.target.classList.contains('btn-edit-movie')) {
            const peli = peliculas.find(p => p.id == id);
            if (peli) {
                peliculaEditandoId = peli.id;
                document.getElementById('movieTitle').value = peli.titulo;
                document.getElementById('movieGenre').value = peli.genero;
                document.getElementById('movieYear').value = peli.año_estreno;
                document.getElementById('movieDuration').value = peli.duracion;
                document.getElementById('movieRanking').value = peli.ranking || 10;
                document.getElementById('movieImage').required = false; 
                
                document.querySelector('.movie-modal-content h2').textContent = 'Editar película';
                movieModal.classList.add('active');
            }
        }

        // CAMBIAR ESTADO
        if (e.target.classList.contains('btn-status-movie')) {
            cambiarEstado(id, e.target.dataset.estado);
        }

        // ELIMINAR
        if (e.target.classList.contains('btn-delete-movie')) {
            if(confirm('¿Mover a papelera (Eliminado)? No se borrará de la base de datos.')) cambiarEstado(id, 'Eliminado');
        }
    });

    async function cambiarEstado(id, estado) {
        await fetch(`/api/peliculas/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        cargarPeliculas();
    }

    // 5. ENVIAR FORMULARIO (POST O PUT)
    movieForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('titulo', document.getElementById('movieTitle').value);
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
            }
        } catch (e) { document.getElementById('movieFormError').textContent = 'Error de conexión'; }
    });

    document.getElementById('adminLogout')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });

    cargarPeliculas();
});