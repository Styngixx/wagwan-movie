document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. TEMA OSCURO / CLARO
    // =========================================
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            themeToggle.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
    }

    // =========================================
    // 2. MODAL DEL DASHBOARD (ADMIN LOGIN)
    // =========================================
    const adminLink = document.getElementById('adminDashboardLink');
    const adminModal = document.getElementById('adminModal');
    const adminModalClose = document.getElementById('adminModalClose');
    const adminForm = document.getElementById('adminLoginForm');

    if (adminLink && adminModal) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            const adminLogged = localStorage.getItem('adminLogged');

            if (adminLogged === 'true') {
                window.location.href = '/pages/admin.html';
            } else {
                adminModal.style.display = 'flex'; 
            }
        });
    }

    if (adminModalClose) {
        adminModalClose.addEventListener('click', () => {
            adminModal.style.display = 'none'; 
        });
    }

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const user = document.getElementById('adminUsuario').value;
            const pass = document.getElementById('adminPassword').value;
            const errorMsg = document.getElementById('adminLoginError');
            
            errorMsg.textContent = "⏳ Validando credenciales en la base de datos...";
            errorMsg.style.color = "#f1c40f"; 
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user, password: pass })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('adminLogged', 'true');
                    localStorage.setItem('adminUser', JSON.stringify(data.user));

                    errorMsg.textContent = "✅ ¡Acceso concedido! Abriendo bóveda...";
                    errorMsg.style.color = "#2ecc71"; 
                    
                    setTimeout(() => {
                        window.location.href = '/pages/admin.html'; // Fix de ruta
                    }, 1500);

                } else {
                    errorMsg.textContent = "❌ " + data.message;
                    errorMsg.style.color = '#e74c3c'; 
                }
            } catch (error) {
                errorMsg.textContent = '🔌 Error fatal: No hay conexión con el servidor Node.';
                errorMsg.style.color = '#e74c3c';
            }
        });
    }

    // =========================================
    // 3. RENDERIZADO DINÁMICO DE PELÍCULAS
    // =========================================
    // EL FIX: Buscamos exactamente el ID que tienes en tu index.html
    const moviesContainer = document.getElementById('movies-container');

    async function cargarPeliculasPublicas() {
        try {
            const response = await fetch('/api/peliculas');
            const peliculas = await response.json();

            // EL FILTRO MÁGICO: Oculta las Suspendidas y Eliminadas
            const peliculasVisibles = peliculas.filter(peli => peli.estado === 'Activo' || !peli.estado);

            if (moviesContainer) {
                renderizarTarjetas(peliculasVisibles);
            }
        } catch (error) {
            console.error("Error cargando películas:", error);
        }
    }

    function renderizarTarjetas(lista) {
        if (!moviesContainer) return;
        moviesContainer.innerHTML = '';

        lista.forEach(pelicula => {
            // LIMPIEZA DE LOS NULLS VISUALES
            const rankingLimpio = pelicula.ranking || 10;
            const anioLimpio = pelicula.año_estreno || 2024;
            const generoLimpio = pelicula.genero || 'Variado';

            const card = document.createElement('div');
            // Usamos la clase movie-card para que funcione con tu buscador
            card.classList.add('movie-card');
            
            // Añadimos estilos básicos en línea para asegurar que se vea bien en tu grid-episodios
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '10px';

            card.innerHTML = `
                <img src="${pelicula.url_portada}" alt="${pelicula.titulo}" style="width: 100%; border-radius: 8px; object-fit: cover; aspect-ratio: 2/3;">
                <div class="movie-info">
                    <h3 style="margin: 0; font-size: 1rem;">${pelicula.titulo}</h3>
                    <p style="font-size: 12px; color: #8b9bb4; margin: 4px 0;">
                        📅 ${anioLimpio} | 🎬 ${generoLimpio}
                    </p>
                    <p style="font-size: 13px; color: #f1c40f; font-weight: bold; margin: 0 0 10px 0;">
                        ⭐ ${rankingLimpio}/10
                    </p>
                    <a href="/public/pages/pelicula.html?id=${pelicula.id}" 
                       style="display: block; text-align: center; background: #2563eb; color: #fff; text-decoration: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 13px;">
                        Ver Detalles
                    </a>
                </div>
            `;
            moviesContainer.appendChild(card);
        });

        // Activamos buscador y filtros RECIÉN cuando las tarjetas ya existen
        activarBuscadorYFiltros();
    }

    // =========================================
    // 4. BUSCADOR Y FILTROS POR CATEGORÍA
    // =========================================
    function activarBuscadorYFiltros() {
        const searchInput = document.querySelector('.search-bar input');
        const filterButtons = document.querySelectorAll('.movie-filter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.movie-card'); 
                
                cards.forEach(card => {
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    card.style.display = title.includes(term) ? 'flex' : 'none'; // 'flex' por los estilos en línea
                });
            });
        }

        if (filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const category = btn.getAttribute('data-category');
                    const cards = document.querySelectorAll('.movie-card');

                    cards.forEach(card => {
                        const generoInfo = card.querySelector('.movie-info p:nth-of-type(1)').textContent;
                        
                        if (category === 'Todas' || generoInfo.includes(category)) {
                            card.style.display = 'flex'; // 'flex' por los estilos en línea
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }
    }

    // Arrancamos el motor principal
    cargarPeliculasPublicas();
});