import { movieCatalog } from './movies.js';

function getFavoriteMovieIds() {
    return JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
}

// Función principal que renderiza el catálogo principal
function renderMovieCatalog(category = 'Todas', searchQuery = '') {
    const catalogElement = document.querySelector('#movie-catalog');

    if (!catalogElement) {
        return;
    }

    // 1. Filtramos por categoría
    let filteredMovies = category === 'Todas'
        ? movieCatalog
        : movieCatalog.filter(movie => movie.genres.includes(category));

    // 2. Filtramos por texto de búsqueda
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filteredMovies = filteredMovies.filter(movie => 
            movie.title.toLowerCase().includes(query) ||
            movie.genres.some(genre => genre.toLowerCase().includes(query))
        );
    }

    if (filteredMovies.length === 0) {
        catalogElement.innerHTML = '<p class="empty-catalog">No hay películas disponibles con esos criterios.</p>';
        return;
    }

    const favoriteMovieIds = getFavoriteMovieIds();

    catalogElement.innerHTML = filteredMovies.map(movie => `
        <a class="card-ep" href="/public/pages/pelicula.html?id=${movie.id}" data-movie-id="${movie.id}">
            <div class="ep-img" style="background-image: url('${movie.poster}')">
                <span class="ep-badge">★ ${movie.rating}</span>
                ${favoriteMovieIds.includes(movie.id) ? '<span class="favorite-indicator" title="Película favorita">♥</span>' : ''}
            </div>
            <div class="ep-title">${movie.title} (${movie.year})</div>
        </a>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderMovieCatalog();

    let currentCategory = 'Todas';

    const movieFilters = document.querySelectorAll('.movie-filter');
    movieFilters.forEach(filterButton => {
        filterButton.addEventListener('click', () => {
            movieFilters.forEach(button => button.classList.remove('active'));
            filterButton.classList.add('active');
            currentCategory = filterButton.dataset.category;
            
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], .search-bar input');
            const query = searchInput ? searchInput.value : '';
            renderMovieCatalog(currentCategory, query);
        });
    });

    // =========================================
    // BÚSQUEDA DINÁMICA CON MENÚ FLOTANTE Y ESTÁTICA (ENTER)
    // =========================================
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], .search-bar input');

    if (searchInput) {
        // Crear contenedor flotante para el autocompletado si no existe
        let dropdown = document.querySelector('.search-dropdown-results');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown-results';
            if (searchInput.parentElement) {
                searchInput.parentElement.style.position = 'relative';
                searchInput.parentElement.appendChild(dropdown);
            }
        }

        // Búsqueda dinámica mientras escribes
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                dropdown.classList.remove('active');
                renderMovieCatalog(currentCategory, '');
                return;
            }

            const filtered = movieCatalog.filter(movie => 
                movie.title.toLowerCase().includes(query) ||
                movie.genres.some(genre => genre.toLowerCase().includes(query))
            );

            if (filtered.length === 0) {
                dropdown.innerHTML = '<p style="padding: 10px; color: #94a3b8; text-align: center; font-size: 13px;">No se encontraron resultados</p>';
                dropdown.classList.add('active');
                return;
            }

            // Renderizamos las sugerencias idénticas al diseño de streaming solicitado
            dropdown.innerHTML = filtered.slice(0, 4).map(movie => `
                <a href="/public/pages/pelicula.html?id=${movie.id}" class="search-result-item">
                    <img src="${movie.poster}" alt="${movie.title}" class="search-result-img">
                    <div class="search-result-info">
                        <h4>${movie.title} (${movie.year})</h4>
                        <p>Película &nbsp; ⏱ ${movie.duration || '1h 45m'} &nbsp; ★ ${movie.rating}</p>
                        <p style="font-size: 11px; color: #64748b;">🛡 ${movie.year}</p>
                    </div>
                </a>
            `).join('') + `
                <a href="#" class="search-all-btn" onclick="event.preventDefault();">Ver todos los resultados</a>
            `;

            dropdown.classList.add('active');
            renderMovieCatalog(currentCategory, query);
        });

        // Búsqueda estática al presionar Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dropdown.classList.remove('active');
                const query = searchInput.value;
                renderMovieCatalog(currentCategory, query);
            }
        });

        // Ocultar menú flotante al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    // =========================================
    // CAMBIO DE TEMA (MODO OSCURO / CLARO)
    // =========================================
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️'; 
        } else {
            themeToggle.textContent = '🌙'; 
        }
        
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                themeToggle.textContent = '☀️'; 
                themeToggle.title = "Cambiar a Modo Claro";
            } else {
                themeToggle.textContent = '🌙';
                themeToggle.title = "Cambiar a Modo Oscuro";
            }
        });
    }

    // Simulación de reproducción
    const playButton = document.querySelector('.btn-primary');
    if (playButton) {
        playButton.addEventListener('click', () => {
            alert("▶ Iniciando película...");
        });
    }

    // =========================================
    // MODAL LOGIN ADMINISTRADOR
    // =========================================
    const adminDashboardLink = document.getElementById('adminDashboardLink');
    const adminModal = document.getElementById('adminModal');
    const adminModalClose = document.getElementById('adminModalClose');

    if (adminDashboardLink && adminModal && adminModalClose) {
        adminDashboardLink.addEventListener('click', (event) => {
            event.preventDefault();
            adminModal.classList.add('active');
        });

        adminModalClose.addEventListener('click', () => {
            adminModal.classList.remove('active');
        });

        adminModal.addEventListener('click', (event) => {
            if (event.target === adminModal) {
                adminModal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                adminModal.classList.remove('active');
            }
        });
    }

    // =========================================
    // VALIDAR LOGIN DEL ADMINISTRADOR
    // =========================================
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminUsuario = document.getElementById('adminUsuario');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginError = document.getElementById('adminLoginError');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const usuarioIngresado = adminUsuario.value.trim();
            const passwordIngresado = adminPassword.value.trim();

            adminLoginError.textContent = '';

            try {
                const response = await fetch('public/data/admins.json');

                if (!response.ok) {
                    throw new Error('No se pudo cargar el archivo de administradores');
                }

                const admins = await response.json();

                const adminValido = admins.find(admin =>
                    admin.usuario === usuarioIngresado &&
                    admin.password === passwordIngresado
                );

                if (adminValido) {
                    localStorage.setItem('adminLogged', 'true');

                    adminLoginError.style.color = '#4ade80';
                    adminLoginError.textContent = 'Acceso correcto';

                    setTimeout(() => {
                        window.location.href = 'public/pages/admin.html';
                    }, 800);

                } else {
                    adminLoginError.style.color = '#ff6b6b';
                    adminLoginError.textContent = 'Usuario o contraseña incorrectos';
                }

            } catch (error) {
                console.error(error);
                adminLoginError.style.color = '#ff6b6b';
                adminLoginError.textContent = 'Error al validar las credenciales';
            }
        });
    }
});