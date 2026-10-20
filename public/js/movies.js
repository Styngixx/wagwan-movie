document.addEventListener('DOMContentLoaded', () => {
    cargarPeliculas();
});

async function cargarPeliculas() {
    try {
        // Le tocamos la puerta a la API de tu backend en Node
        const response = await fetch('/api/peliculas');
        const peliculasVisibles = peliculas.filter(peli => peli.estado === 'Activo' || !peli.estado);

        if (!response.ok) {
            throw new Error('Error al conectar con la base de datos');
        }
        
        const peliculas = await response.json();
        
        // Un console.log salvaje para que veas en F12 que la data sí llega
        console.log("¡Data recibida de Supabase, maibroda!", peliculas);
        
        renderizarCatalogo(peliculas);
    } catch (error) {
        console.error('Error:', error);
        const contenedor = document.getElementById('movies-container');
        if (contenedor) {
            contenedor.innerHTML = '<p style="color:white; text-align:center;">Error al cargar las películas. Revisa tu consola.</p>';
        }
    }
}

function renderizarCatalogo(peliculas) {
    const contenedor = document.getElementById('movies-container'); 
    
    // Si no encuentra el ID en tu HTML, no hace nada para no crashear
    if (!contenedor) {
        console.error("No se encontró el <div id='movies-container'> en tu HTML");
        return;
    }

    contenedor.innerHTML = ''; // Limpiamos antes de pintar

    // Recorremos la data y armamos las tarjetas
    peliculas.forEach(pelicula => {
        const cardHTML = `
            <div class="movie-card">
                <img src="${pelicula.url_portada}" alt="${pelicula.titulo}" class="movie-img" style="width:100%; border-radius:8px;">
                <div class="movie-info" style="padding: 10px 0;">
                    <h3 style="margin: 5px 0; font-size: 1.1rem;">${pelicula.titulo}</h3>
                    <p style="margin: 0; font-size: 0.9rem; color: #ccc;">📅 ${pelicula.año_estreno} | 🎬 ${pelicula.genero}</p>
                    <p style="margin: 5px 0; font-size: 0.9rem; color: #f1c40f;">⭐ ${pelicula.ranking || 10}/10</p>
                    <a href="/public/pages/pelicula.html?id=${pelicula.id}" class="btn-ver" style="display:inline-block; margin-top:10px; background:#007bff; color:white; padding:5px 10px; text-decoration:none; border-radius:5px;">Ver Detalles</a>
                </div>
            </div>
        `;
        contenedor.innerHTML += cardHTML;
    });
}