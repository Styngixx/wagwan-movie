document.addEventListener('DOMContentLoaded', () => {

    // === 1. TEMA GLOBAL ===
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('wagwanTheme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.textContent = '🌙';
    }

    themeToggle?.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('wagwanTheme', isDark ? 'dark' : 'light');
    });

    // === 2. MANEJO DE SESIÓN Y BOTONES ===
    const btnEntrar = document.getElementById('btnEntrar');
    const btnRegistro = document.getElementById('btnRegistro');
    
    const adminLogged = localStorage.getItem('adminLogged') === 'true';
    const userLogged = localStorage.getItem('userLogged') === 'true';

    // Si hay alguien logueado, transformamos los botones
    if (adminLogged) {
        if (btnEntrar) {
            btnEntrar.textContent = 'Dashboard';
            btnEntrar.style.color = 'var(--accent-blue)';
            btnEntrar.style.fontWeight = 'bold';
            // Clonamos para limpiar eventos previos
            btnEntrar.replaceWith(btnEntrar.cloneNode(true));
            document.getElementById('btnEntrar').addEventListener('click', () => window.location.href = '/pages/admin.html');
        }
        if (btnRegistro) {
            btnRegistro.textContent = 'Cerrar Sesión';
            btnRegistro.style.background = '#e74c3c';
            btnRegistro.replaceWith(btnRegistro.cloneNode(true));
            document.getElementById('btnRegistro').addEventListener('click', () => {
                localStorage.clear();
                window.location.reload();
            });
        }
    } else if (userLogged) {
        if (btnEntrar) btnEntrar.style.display = 'none'; // Ocultamos "Entrar" al usuario normi
        if (btnRegistro) {
            btnRegistro.textContent = 'Cerrar Sesión';
            btnRegistro.style.background = '#e74c3c';
            btnRegistro.replaceWith(btnRegistro.cloneNode(true));
            document.getElementById('btnRegistro').addEventListener('click', () => {
                localStorage.clear();
                window.location.reload();
            });
        }
    } else {
        // Si no hay nadie logueado, abren el modal normal
        btnEntrar?.addEventListener('click', () => abrirModalAuth(true));
        btnRegistro?.addEventListener('click', () => abrirModalAuth(false));
    }


    // === 3. MODAL AUTENTICACIÓN ===
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authDesc = document.getElementById('authDesc');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    let isLoginMode = true;

    document.getElementById('authModalClose')?.addEventListener('click', () => authModal.style.display = 'none');

    function abrirModalAuth(isLogin) {
        isLoginMode = isLogin;
        authTitle.textContent = isLogin ? 'Iniciar Sesión' : 'Registro Gratis';
        authDesc.textContent = isLogin ? 'Ingresa a tu cuenta para ver tu contenido.' : 'Crea tu cuenta para disfrutar del contenido.';
        authSubmitBtn.textContent = isLogin ? 'Entrar' : 'Registrarse';
        document.getElementById('authError').textContent = '';
        authModal.style.display = 'flex';
    }

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('authUsuario').value;
        const pass = document.getElementById('authPassword').value;
        const errorMsg = document.getElementById('authError');
        
        errorMsg.textContent = "⏳ Procesando...";
        errorMsg.style.color = "#f1c40f";
        
        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/registro';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: user, password: pass, rol: 'user' }) 
            });
            const data = await response.json();

            if (data.success) {
                errorMsg.style.color = "#2ecc71";
                if (!isLoginMode) {
                    errorMsg.textContent = "✅ Cuenta creada. Inicia sesión.";
                    setTimeout(() => abrirModalAuth(true), 1500);
                } else {
                    errorMsg.textContent = "✅ Acceso concedido.";
                    if (data.user.rol === 'admin') {
                        localStorage.setItem('adminLogged', 'true');
                        localStorage.setItem('adminUser', JSON.stringify(data.user));
                        setTimeout(() => window.location.href = '/pages/admin.html', 1000);
                    } else {
                        localStorage.setItem('userLogged', 'true');
                        localStorage.setItem('userData', JSON.stringify(data.user));
                        setTimeout(() => window.location.reload(), 1000);
                    }
                }
            } else {
                errorMsg.textContent = "❌ " + data.message;
                errorMsg.style.color = '#e74c3c';
            }
        } catch (error) {
            errorMsg.textContent = '🔌 Error de conexión con el servidor.';
            errorMsg.style.color = '#e74c3c';
        }
    });

    // === 4. CARGA DE PELÍCULAS, BANNERS, TOP Y BUSCADOR ===
    let todasLasPeliculas = [];

    async function cargarTodaLaData() {
        try {
            const response = await fetch('/api/peliculas');
            todasLasPeliculas = await response.json();

            const catalogo = todasLasPeliculas.filter(p => p.estado === 'Activo' || !p.estado);
            renderizarCatalogo(catalogo);
            activarFiltros(catalogo);

            const banners = todasLasPeliculas.filter(p => p.estado_banner === 'Activo');
            iniciarCarruselBanners(banners);

            const tops = todasLasPeliculas.filter(p => p.estado_top === 'Activo');
            renderizarTopEstrenos(tops);

            activarBuscador(catalogo);

        } catch (error) { console.error("Error cargando la data:", error); }
    }

    function renderizarCatalogo(lista) {
        const container = document.getElementById('movies-container');
        if (!container) return;
        container.innerHTML = '';

        lista.forEach(pelicula => {
            container.innerHTML += `
                <div class="card-ep" onclick="window.location.href='/pages/pelicula.html?id=${pelicula.id}'">
                    <div class="ep-img" style="background-image: url('${pelicula.url_portada}');">
                        <span class="ep-badge">⭐ ${pelicula.ranking || 10}/10</span>
                    </div>
                    <div style="padding: 8px 5px;">
                        <h3 style="font-size:14px; margin-bottom:2px; color:var(--text-main);">${pelicula.titulo}</h3>
                        <p style="font-size:12px; color:var(--text-muted);">📅 ${pelicula.año_estreno} | 🎬 ${pelicula.genero}</p>
                    </div>
                </div>
            `;
        });
    }

    function iniciarCarruselBanners(banners) {
        const container = document.getElementById('heroBannerContainer');
        if (!container || banners.length === 0) {
            if(container) container.style.display = 'none';
            return;
        }

        let index = 0;
        function cambiarBanner() {
            const peli = banners[index];
            container.style.backgroundImage = `var(--hero-overlay), url('${peli.url_portada}')`;
            container.innerHTML = `
                <div class="hero-content" style="animation: fadeIn 0.5s ease;">
                    <h1>${peli.titulo}</h1>
                    <div class="meta-info">
                        <span class="rating">⭐ ${peli.ranking || 10}/10</span>
                        <span class="year">${peli.año_estreno}</span>
                        <span>${peli.genero}</span>
                        <span class="quality">HD</span>
                    </div>
                    <button class="btn-primary" onclick="window.location.href='/pages/pelicula.html?id=${peli.id}'">▶ Ver Película</button>
                </div>
            `;
            index = (index + 1) % banners.length; 
        }

        cambiarBanner(); 
        setInterval(cambiarBanner, 6000); 
    }

    function renderizarTopEstrenos(tops) {
        const container = document.getElementById('topEstrenosContainer');
        if (!container) return;
        container.innerHTML = '';
        
        const top5 = tops.slice(0, 5); 

        top5.forEach((peli, i) => {
            container.innerHTML += `
                <div class="top-item" style="cursor:pointer;" onclick="window.location.href='/pages/pelicula.html?id=${peli.id}'">
                    <div class="top-img" style="background-image: url('${peli.url_portada}');">
                        <span class="rank">#${i + 1}</span>
                    </div>
                    <div class="top-info">
                        <h4 style="color:var(--text-main); font-size: 13px;">${peli.titulo}</h4>
                        <span class="top-meta">Película ★ ${peli.ranking || 10}</span>
                        <span class="top-year">${peli.año_estreno}</span>
                    </div>
                </div>
            `;
        });
    }

    function activarBuscador(listaCatalogo) {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (!term) {
                searchResults.classList.remove('active');
                return;
            }

            const matches = listaCatalogo.filter(p => p.titulo.toLowerCase().includes(term));

            if (matches.length > 0) {
                matches.slice(0, 5).forEach(peli => {
                    const tipoLabel = peli.tipo === 'serie' ? 'Serie' : 'Película';
                    searchResults.innerHTML += `
                        <a href="/pages/pelicula.html?id=${peli.id}" class="search-result-item" style="text-decoration:none;">
                            <img src="${peli.url_portada}" width="40" height="55" style="border-radius:4px; object-fit:cover;">
                            <div>
                                <h4 style="margin:0; font-size:14px; color:var(--text-main);">${peli.titulo}</h4>
                                <p style="margin:0; font-size:12px; color:var(--accent-blue); font-weight:bold;">${tipoLabel} <span style="color:var(--text-muted); font-weight:normal;">| 📅 ${peli.año_estreno} | ⭐ ${peli.ranking || 10}</span></p>
                            </div>
                        </a>
                    `;
                });
            } else {
                searchResults.innerHTML = '<div style="padding:10px; text-align:center; color:var(--text-muted); font-size:13px;">No hay resultados 🍿</div>';
            }
            searchResults.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.classList.remove('active');
            }
        });
    }

    function activarFiltros(listaCatalogo) {
        const filterButtons = document.querySelectorAll('.movie-filter');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');
                if (category === 'Todas') {
                    renderizarCatalogo(listaCatalogo);
                } else {
                    const filtradas = listaCatalogo.filter(p => p.genero.includes(category));
                    renderizarCatalogo(filtradas);
                }
            });
        });
    }

    cargarTodaLaData();
});

module.exports = app;