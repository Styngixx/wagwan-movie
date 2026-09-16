import { movieCatalog } from './movies.js';

function getFavoriteMovieIds() {
    return JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
}

function renderMovieCatalog(category = 'Todas') {
    const catalogElement = document.querySelector('#movie-catalog');

    if (!catalogElement) {
        return;
    }

    const filteredMovies = category === 'Todas'
        ? movieCatalog
        : movieCatalog.filter(movie => movie.genres.includes(category));

    if (filteredMovies.length === 0) {
        catalogElement.innerHTML = '<p class="empty-catalog">No hay películas disponibles en esta categoría.</p>';
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

    const movieFilters = document.querySelectorAll('.movie-filter');
    movieFilters.forEach(filterButton => {
        filterButton.addEventListener('click', () => {
            movieFilters.forEach(button => button.classList.remove('active'));
            filterButton.classList.add('active');
            renderMovieCatalog(filterButton.dataset.category);
        });
    });
    
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Inicializar el icono dependiendo de si el HTML tiene la clase dark-mode
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️'; // Mostrar sol porque estamos en oscuro
    } else {
        themeToggle.textContent = '🌙'; // Mostrar luna porque estamos en claro
    }
    
    // Cambiar de tema al hacer clic
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

    // Interactividad básica para la simulación
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

    // Abrir modal
    adminDashboardLink.addEventListener('click', (event) => {
        event.preventDefault();
        adminModal.classList.add('active');
    });

    // Cerrar con la X
    adminModalClose.addEventListener('click', () => {
        adminModal.classList.remove('active');
    });

    // Cerrar haciendo clic fuera de la ventana
    adminModal.addEventListener('click', (event) => {
        if (event.target === adminModal) {
            adminModal.classList.remove('active');
        }
    });

    // Cerrar con ESC
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

                // Guardamos la sesión del administrador
                localStorage.setItem('adminLogged', 'true');

                adminLoginError.style.color = '#4ade80';
                adminLoginError.textContent = 'Acceso correcto';

                // Esperamos un momento y entramos al dashboard
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