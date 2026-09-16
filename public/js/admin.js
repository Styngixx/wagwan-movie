document.addEventListener('DOMContentLoaded', () => {

        // =========================================
    // PROTEGER DASHBOARD
    // =========================================

    const adminLogged = localStorage.getItem('adminLogged');

    if (adminLogged !== 'true') {
        window.location.href = '../../index.html';
        return;
    }

    const moviesTableBody = document.getElementById('moviesTableBody');
    const adminLogout = document.getElementById('adminLogout');
    const totalMovies = document.getElementById('totalMovies');
    const totalGenres = document.getElementById('totalGenres');
    const total2026 = document.getElementById('total2026');
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
    let peliculaEditandoId = null;


    // =========================================
    // CARGAR PELÍCULAS
    // =========================================

    async function cargarPeliculas() {

        try {

            const peliculasGuardadas = localStorage.getItem('peliculas');

            // Si ya existen películas guardadas usamos localStorage
            if (peliculasGuardadas) {

                peliculas = JSON.parse(peliculasGuardadas);

            } else {

                // Primera carga desde peliculas.json
                const response = await fetch('../data/peliculas.json');

                if (!response.ok) {
                    throw new Error('No se pudieron cargar las películas');
                }

                peliculas = await response.json();

                localStorage.setItem(
                    'peliculas',
                    JSON.stringify(peliculas)
                );
            }

            mostrarPeliculas(peliculas);

        } catch (error) {

            console.error('Error al cargar películas:', error);

        }
    }

    // =========================================
// ACTUALIZAR ESTADÍSTICAS
// =========================================

function actualizarEstadisticas(listaPeliculas) {

    // Total de películas
    totalMovies.textContent = listaPeliculas.length;

    // Total de géneros diferentes
    const generos = new Set(
        listaPeliculas.map(pelicula => pelicula.genero)
    );

    totalGenres.textContent = generos.size;

    // Películas del año 2026
    const estrenos2026 = listaPeliculas.filter(
        pelicula => pelicula.anio === 2026
    );

    total2026.textContent = estrenos2026.length;
}


    // =========================================
    // MOSTRAR PELÍCULAS
    // =========================================

    function mostrarPeliculas(listaPeliculas) {

        moviesTableBody.innerHTML = '';
        actualizarEstadisticas(listaPeliculas);

        listaPeliculas.forEach(pelicula => {

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

                    <button
                        class="btn-edit-movie"
                        data-id="${pelicula.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-delete-movie"
                        data-id="${pelicula.id}"
                    >
                        Eliminar
                    </button>

                </td>
            `;

            moviesTableBody.appendChild(fila);

        });


        // =========================================
        // ELIMINAR PELÍCULA
        // =========================================

        const deleteButtons =
            document.querySelectorAll('.btn-delete-movie');

        deleteButtons.forEach(button => {

            button.addEventListener('click', () => {

                const id = Number(button.dataset.id);

                const pelicula = listaPeliculas.find(
                    pelicula => pelicula.id === id
                );

                if (!pelicula) {
                    return;
                }

                const confirmar = confirm(
                    `¿Seguro que deseas eliminar "${pelicula.titulo}"?`
                );

                if (!confirmar) {
                    return;
                }

                peliculas = peliculas.filter(
                    pelicula => pelicula.id !== id
                );

                localStorage.setItem(
                    'peliculas',
                    JSON.stringify(peliculas)
                );

                mostrarPeliculas(peliculas);

            });

        });


        // =========================================
        // EDITAR PELÍCULA
        // =========================================

        const editButtons =
            document.querySelectorAll('.btn-edit-movie');

        editButtons.forEach(button => {

            button.addEventListener('click', () => {

                const id = Number(button.dataset.id);

                const pelicula = listaPeliculas.find(
                    pelicula => pelicula.id === id
                );

                if (!pelicula) {
                    return;
                }

                // Guardar el ID de la película que estamos editando
peliculaEditandoId = pelicula.id;

// Cargar los datos en el formulario
movieTitle.value = pelicula.titulo;
movieGenre.value = pelicula.genero;
movieYear.value = pelicula.anio;
movieDuration.value = pelicula.duracion;
movieImage.value = pelicula.imagen;

// Cambiar el título del modal
document.querySelector('.movie-modal-content h2').textContent =
    'Editar película';

// Cambiar el texto del botón
document.querySelector('.movie-save-button').textContent =
    'Guardar cambios';

// Abrir el modal
movieModal.classList.add('active'); 

            });

        });

    }


    // =========================================
    // ABRIR / CERRAR MODAL
    // =========================================

    if (
        btnAddMovie &&
        movieModal &&
        movieModalClose
    ) {

        btnAddMovie.addEventListener('click', () => {

    // Indicamos que vamos a crear una película nueva
    peliculaEditandoId = null;

    // Limpiamos el formulario
    movieForm.reset();

    // Limpiamos mensajes anteriores
    movieFormError.textContent = '';

    // Restauramos los textos del modal
    document.querySelector('.movie-modal-content h2').textContent =
        'Agregar película';

    document.querySelector('.movie-save-button').textContent =
        'Guardar película';

    // Abrimos el modal
    movieModal.classList.add('active');

});


        // Cerrar con X
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
// CREAR / EDITAR PELÍCULA
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

        // Validar campos
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


        // =========================================
        // SI ESTAMOS EDITANDO
        // =========================================

        if (peliculaEditandoId !== null) {

            const indice = peliculas.findIndex(
                pelicula => pelicula.id === peliculaEditandoId
            );

            if (indice !== -1) {

                peliculas[indice] = {
                    id: peliculaEditandoId,
                    titulo: titulo,
                    genero: genero,
                    anio: anio,
                    duracion: duracion,
                    imagen: imagen
                };

            }

        } else {

            // =========================================
            // SI ESTAMOS CREANDO
            // =========================================

            const nuevaPelicula = {

                id: Date.now(),
                titulo: titulo,
                genero: genero,
                anio: anio,
                duracion: duracion,
                imagen: imagen

            };

            peliculas.push(nuevaPelicula);

        }


        // Guardar cambios
        localStorage.setItem(
            'peliculas',
            JSON.stringify(peliculas)
        );


        // Actualizar tabla
        mostrarPeliculas(peliculas);


        // Limpiar formulario
        movieForm.reset();


        // Ya no estamos editando
        peliculaEditandoId = null;


        // Restaurar textos del modal
        document.querySelector('.movie-modal-content h2').textContent =
            'Agregar película';

        document.querySelector('.movie-save-button').textContent =
            'Guardar película';


        // Cerrar modal
        movieModal.classList.remove('active');

    });

}


    // =========================================
// CERRAR SESIÓN
// =========================================

if (adminLogout) {

    adminLogout.addEventListener('click', () => {

        // Eliminar sesión del administrador
        localStorage.removeItem('adminLogged');

        // Volver a la página principal
        window.location.href = '../../index.html';

    });

}

    cargarPeliculas();

});