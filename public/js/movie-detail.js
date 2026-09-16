import { movieCatalog } from './movies.js';

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
            <a class="btn-primary" href="/index.html#movie-catalog">▶ Ver más películas</a>
        </div>
    `;
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