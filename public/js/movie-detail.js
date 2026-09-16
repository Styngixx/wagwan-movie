import { movieCatalog } from './movies.js';

const favoriteStorageKey = 'favoriteMovies';

function getFavoriteMovieIds() {
    return JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
}

function saveFavoriteMovieIds(favoriteMovieIds) {
    localStorage.setItem(favoriteStorageKey, JSON.stringify(favoriteMovieIds));
}

function renderRecommendations(movie) {
    const recommendationsElement = document.querySelector('#movie-recommendations');

    if (!recommendationsElement) {
        return;
    }

    const recommendations = movieCatalog
        .filter(candidate => candidate.id !== movie.id)
        .map(candidate => ({
            movie: candidate,
            sharedGenres: candidate.genres.filter(genre => movie.genres.includes(genre)).length
        }))
        .filter(item => item.sharedGenres > 0)
        .sort((first, second) => second.sharedGenres - first.sharedGenres)
        .slice(0, 4)
        .map(item => item.movie);

    if (recommendations.length === 0) {
        recommendationsElement.innerHTML = '';
        return;
    }

    recommendationsElement.innerHTML = `
        <div class="recommendations-heading">
            <span class="detail-kicker">PORQUE TE GUSTA ${movie.genres.join(' Y ').toUpperCase()}</span>
            <h2>También te puede gustar</h2>
        </div>
        <div class="recommendations-grid grid-episodios">
            ${recommendations.map(recommendedMovie => `
                <a class="card-ep" href="/public/pages/pelicula.html?id=${recommendedMovie.id}">
                    <div class="ep-img" style="background-image: url('${recommendedMovie.poster}')">
                        <span class="ep-badge">★ ${recommendedMovie.rating}</span>
                    </div>
                    <div class="ep-title">${recommendedMovie.title} (${recommendedMovie.year})</div>
                </a>
            `).join('')}
        </div>
    `;
}

function updateFavoriteButton(movieId) {
    const favoriteButton = document.querySelector('#favorite-button');

    if (!favoriteButton) {
        return;
    }

    const isFavorite = getFavoriteMovieIds().includes(movieId);
    favoriteButton.classList.toggle('is-favorite', isFavorite);
    favoriteButton.innerHTML = isFavorite ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos';
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
}

function initializeFavoriteButton(movieId) {
    const favoriteButton = document.querySelector('#favorite-button');

    if (!favoriteButton) {
        return;
    }

    updateFavoriteButton(movieId);
    favoriteButton.addEventListener('click', () => {
        const favoriteMovieIds = getFavoriteMovieIds();
        const favoriteIndex = favoriteMovieIds.indexOf(movieId);

        if (favoriteIndex === -1) {
            favoriteMovieIds.push(movieId);
        } else {
            favoriteMovieIds.splice(favoriteIndex, 1);
        }

        saveFavoriteMovieIds(favoriteMovieIds);
        updateFavoriteButton(movieId);
    });
}

function renderMovieDetail() {
    const detailElement = document.querySelector('#movie-detail');
    const movieId = new URLSearchParams(window.location.search).get('id');
    const movie = movieCatalog.find(item => item.id === movieId);

    if (!detailElement) {
        return;
    }

    if (!movie) {
        detailElement.innerHTML = `
            <div class="movie-not-found">
                <h1>Película no encontrada</h1>
                <p>La película que buscas no está disponible en el catálogo.</p>
                <a class="btn-primary" href="/index.html#movie-catalog">Volver al catálogo</a>
            </div>
        `;
        return;
    }

    detailElement.innerHTML = `
        <div class="movie-detail-poster" style="background-image: url('${movie.poster}')"></div>
        <div class="movie-detail-content">
            <span class="detail-kicker">PELÍCULA WAGWAN</span>
            <h1>${movie.title}</h1>
            <div class="detail-meta">
                <span class="detail-rating">★ ${movie.rating}/10</span>
                <span>${movie.year}</span>
                <span>${movie.duration}</span>
            </div>
            <div class="detail-genres">
                ${movie.genres.map(genre => `<span>${genre}</span>`).join('')}
            </div>
            <h2>Sinopsis</h2>
            <p class="detail-synopsis">${movie.synopsis}</p>
            <button class="favorite-button" id="favorite-button" type="button" aria-pressed="false"></button>
            <a class="btn-primary" href="/index.html#movie-catalog">▶ Ver más películas</a>
        </div>
    `;

    document.querySelector('.movie-detail-page').style.setProperty('--detail-backdrop', `url('${movie.poster}')`);
    initializeFavoriteButton(movie.id);
    renderRecommendations(movie);
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
    renderMovieDetail();
    initializeThemeToggle();
});