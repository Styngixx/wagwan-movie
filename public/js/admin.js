document.addEventListener('DOMContentLoaded', () => {

    const moviesTableBody = document.getElementById('moviesTableBody');

    const btnAddMovie = document.getElementById('btnAddMovie');
    const movieModal = document.getElementById('movieModal');
    const movieModalClose = document.getElementById('movieModalClose');
    const movieForm = document.getElementById('movieForm');
    const movieTitle = document.getElementById('movieTitle');
    const movieGenre = document.getElementById('movieGenre');
    const movieYear = document.getElementById('movieYear');
    const movieDuration = document.getElementById('movieDuration');
    const movieImage = document.getElementById('movieImage');
    const movieFormError = document.getElementById('movieFormError');

let peliculas = [];

    // Cargar películas desde el JSON
    async function cargarPeliculas() {

    try {

        const peliculasGuardadas = localStorage.getItem('peliculas');

        // Si ya existen películas guardadas, usamos esas
        if (peliculasGuardadas) {

            peliculas = JSON.parse(peliculasGuardadas);

        } else {

            // Si es la primera vez, cargamos el JSON inicial
            const response = await fetch('../data/peliculas.json');

            if (!response.ok) {
                throw new Error('No se pudieron cargar las películas');
            }

            peliculas = await response.json();

            // Guardamos la lista inicial en localStorage
            localStorage.setItem(
                'peliculas',
                JSON.stringify(peliculas)
            );
        }

        mostrarPeliculas(peliculas);

    } catch (error) {

        console.error('Error:', error);

    }
}


    // Mostrar películas en la tabla
    function mostrarPeliculas(peliculas) {

        moviesTableBody.innerHTML = '';

        peliculas.forEach(pelicula => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>
                    <img
                        src="${pelicula.imagen}"
                        alt="${pelicula.titulo}"
                        width="55"
                    >
                </td>

                <td>${pelicula.titulo}</td>

                <td>${pelicula.genero}</td>

                <td>${pelicula.anio}</td>

                <td>${pelicula.duracion}</td>

                <td>
                    <button>Editar</button>
                    <button>Eliminar</button>
                </td>
            `;

            moviesTableBody.appendChild(fila);

        });

    }

    // =========================================
// MODAL AGREGAR PELÍCULA
// =========================================

if (btnAddMovie && movieModal && movieModalClose) {

    // Abrir modal
    btnAddMovie.addEventListener('click', () => {
        movieModal.classList.add('active');
    });

    // Cerrar con la X
    movieModalClose.addEventListener('click', () => {
        movieModal.classList.remove('active');
    });

    // Cerrar haciendo clic fuera
    movieModal.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            movieModal.classList.remove('active');
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            movieModal.classList.remove('active');
        }
    });
}
// =========================================
// CREAR NUEVA PELÍCULA
// =========================================

if (movieForm) {

    movieForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const titulo = movieTitle.value.trim();
        const genero = movieGenre.value;
        const anio = Number(movieYear.value);
        const duracion = movieDuration.value.trim();
        const imagen = movieImage.value.trim();

        movieFormError.textContent = '';

        if (
            !titulo ||
            !genero ||
            !anio ||
            !duracion ||
            !imagen
        ) {
            movieFormError.textContent =
                'Todos los campos son obligatorios';

            return;
        }

        const nuevaPelicula = {
            id: Date.now(),
            titulo: titulo,
            genero: genero,
            anio: anio,
            duracion: duracion,
            imagen: imagen
        };

        peliculas.push(nuevaPelicula);

        localStorage.setItem(
            'peliculas',
            JSON.stringify(peliculas)
        );

        mostrarPeliculas(peliculas);

        movieForm.reset();

        movieModal.classList.remove('active');
    });
}


    cargarPeliculas();

});