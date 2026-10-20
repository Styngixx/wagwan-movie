document.addEventListener('DOMContentLoaded', () => {
    // 1. Extraemos el ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        cargarDetallePelicula(movieId);
    } else {
        document.getElementById('detalle-container').innerHTML = '<h2>No se especificó ninguna película.</h2>';
    }
});

// 2. Consumir la API para traer 1 sola película + sus enlaces
async function cargarDetallePelicula(id) {
    try {
        const response = await fetch(`/api/peliculas/${id}`);
        
        if (!response.ok) {
            throw new Error('Película no encontrada');
        }
        
        const pelicula = await response.json();
        renderizarDetalle(pelicula);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('detalle-container').innerHTML = '<h2>Error al cargar los detalles de la película.</h2>';
    }
}

// 3. Pintar la data en el HTML
function renderizarDetalle(pelicula) {
    // Actualizamos los textos e imagen (asegúrate de tener estos IDs en tu pelicula.html)
    document.getElementById('titulo-pelicula').textContent = pelicula.titulo;
    document.getElementById('sinopsis-pelicula').textContent = pelicula.sinopsis;
    document.getElementById('portada-pelicula').src = pelicula.url_portada;
    document.getElementById('anio-pelicula').textContent = `Año: ${pelicula.anio_estreno}`;

    // Renderizamos la lista de enlaces
    const enlacesContainer = document.getElementById('enlaces-container');
    enlacesContainer.innerHTML = '';

    // Verificamos si la película trae enlaces desde la tabla conectada
    if (pelicula.enlaces && pelicula.enlaces.length > 0) {
        pelicula.enlaces.forEach(enlace => {
            const btnEnlace = `
                <a href="${enlace.url}" target="_blank" class="btn-servidor">
                    🎬 Ver en ${enlace.servidor} | ${enlace.calidad} - ${enlace.idioma}
                </a>
            `;
            enlacesContainer.innerHTML += btnEnlace;
        });
    } else {
        enlacesContainer.innerHTML = '<p>Aún no hay enlaces disponibles para esta película.</p>';
    }
}