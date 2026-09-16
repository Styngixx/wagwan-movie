document.addEventListener('DOMContentLoaded', () => {
    cargarPeliculas();
});

// Carga las películas desde la API de Node.js
async function cargarPeliculas() {
    try {
        const response = await fetch('/api/peliculas');

        if (!response.ok) {
            throw new Error('Error al conectar con la base de datos');
        }

        const peliculas = await response.json();
        renderizarCatalogo(peliculas);

    } catch (error) {
        console.error('Error:', error);

        const contenedor = document.getElementById('movie-catalog');

        if (contenedor) {
            contenedor.innerHTML = `
                <p class="error-mensaje">
                    Error al cargar las películas. Intenta de nuevo más tarde.
                </p>
            `;
        }
    }
}

// Renderiza las películas en el catálogo
function renderizarCatalogo(peliculas) {
    const contenedor = document.getElementById('movie-catalog');

    if (!contenedor) {
        console.error('No se encontró el contenedor #movie-catalog');
        return;
    }

    contenedor.innerHTML = '';

    peliculas.forEach(pelicula => {
        const cardHTML = `
            <div class="movie-card">
                <img
                    src="${pelicula.url_portada}"
                    alt="${pelicula.titulo}"
                    class="movie-img"
                >

                <div class="movie-info">
                    <h3>${pelicula.titulo}</h3>

                    <p>Estreno: ${pelicula.anio_estreno}</p>

                    <p>
                        Géneros:
                        ${
                            pelicula.generos
                                ? pelicula.generos.join(', ')
                                : 'N/A'
                        }
                    </p>

                    <a
                        href="/pages/pelicula.html?id=${pelicula.id}"
                        class="btn-ver"
                    >
                        Ver Detalles
                    </a>
                </div>
            </div>
        `;

        contenedor.insertAdjacentHTML('beforeend', cardHTML);
    });
}
