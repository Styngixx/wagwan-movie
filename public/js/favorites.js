import { movieCatalog } from './movies.js';

const favoriteStorageKey = 'favoriteMovies';

function getFavoriteMovieIds() {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
}

function saveFavoriteMovieIds(favoriteMovieIds) {
    localStorage.setItem(favoriteStorageKey, JSON.stringify(favoriteMovieIds));
}

function renderFavorites() {
    const favoritesContent = document.querySelector('#favorites-content');
    const favoriteMovieIds = getFavoriteMovieIds();
    const favoriteMovies = movieCatalog.filter(movie => favoriteMovieIds.includes(movie.id));

    if (!favoritesContent) {
        return;
    }

    if (favoriteMovies.length === 0) {
        favoritesContent.innerHTML = `
            <div class="empty-favorites">
                <div class="empty-favorites-icon">♡</div>
                <h2>Aún no tienes películas favoritas</h2>
                <p>Explora el catálogo y agrega las películas que quieras guardar.</p>
                <a class="btn-primary" href="/index.html#movie-catalog">Explorar películas</a>
            </div>
        `;
        return;
    }

    favoritesContent.innerHTML = `
        <div class="favorites-grid grid-episodios">
            ${favoriteMovies.map(movie => `
                <article class="favorite-card">
                    <a class="card-ep" href="/public/pages/pelicula.html?id=${movie.id}">
                        <div class="ep-img" style="background-image: url('${movie.poster}')">
                            <span class="ep-badge">★ ${movie.rating}</span>
                            <span class="favorite-indicator" title="Película favorita">♥</span>
                        </div>
                        <div class="ep-title">${movie.title} (${movie.year})</div>
                    </a>
                    <button class="remove-favorite" type="button" data-movie-id="${movie.id}">
                        Quitar de favoritos
                    </button>
                </article>
            `).join('')}
        </div>
    `;

    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', () => {
            const updatedFavoriteIds = getFavoriteMovieIds().filter(movieId => movieId !== button.dataset.movieId);
            saveFavoriteMovieIds(updatedFavoriteIds);
            renderFavorites();
        });
    });
}

function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (!themeToggle) {
        return;
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        themeToggle.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
        themeToggle.title = body.classList.contains('dark-mode')
            ? 'Cambiar a Modo Claro'
            : 'Cambiar a Modo Oscuro';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
    initializeThemeToggle();
});