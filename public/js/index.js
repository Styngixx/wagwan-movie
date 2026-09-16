document.addEventListener('DOMContentLoaded', () => {

    // 1. TEMA OSCURO / CLARO
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            // Cambiamos el iconito
            themeToggle.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
        });
    }

    // 2. MODAL DEL DASHBOARD (ADMIN)
    const adminLink = document.getElementById('adminDashboardLink');
    const adminModal = document.getElementById('adminModal');
    const adminModalClose = document.getElementById('adminModalClose');
    const adminForm = document.getElementById('adminLoginForm');

    if (adminLink && adminModal) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            adminModal.style.display = 'flex'; // Muestra el modal
        });
    }

    if (adminModalClose) {
        adminModalClose.addEventListener('click', () => {
            adminModal.style.display = 'none'; // Oculta el modal
        });
    }

   // 2. MODAL DEL DASHBOARD (ADMIN) - Con Latencia Elegante
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Freno de mano
            
            const user = document.getElementById('adminUsuario').value;
            const pass = document.getElementById('adminPassword').value;
            const errorMsg = document.getElementById('adminLoginError');
            
            // 1. Efecto visual de "Cargando..."
            errorMsg.textContent = "⏳ Validando credenciales en la base de datos...";
            errorMsg.style.color = "#f1c40f"; // Amarillo
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user, password: pass })
                });

                const data = await response.json();

                if (data.success) {
                    // 2. Luz verde visual
                    errorMsg.textContent = "✅ ¡Acceso concedido! Abriendo bóveda...";
                    errorMsg.style.color = "#2ecc71"; // Verde
                    
                    // 3. La famosa latencia (1.5 segundos = 1500 milisegundos) antes de redirigir
                    setTimeout(() => {
                        window.location.href = '/public/pages/admin.html';
                    }, 1500);

                } else {
                    // Si falla (mal user, mala pass o no es admin)
                    errorMsg.textContent = "❌ " + data.message;
                    errorMsg.style.color = '#e74c3c'; // Rojo
                }
            } catch (error) {
                errorMsg.textContent = '🔌 Error fatal: No hay conexión con el servidor Node.';
                errorMsg.style.color = '#e74c3c';
            }
        });
    }

    // 3. BUSCADOR DE PELÍCULAS
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.movie-card'); // Captura las tarjetas que trajo Supabase
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 4. FILTROS POR CATEGORÍA
    const filterButtons = document.querySelectorAll('.movie-filter');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Quitar clase active a todos y dársela al que clickeaste
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');
                const cards = document.querySelectorAll('.movie-card');

                cards.forEach(card => {
                    // El género está en el segundo párrafo de la tarjeta
                    const genreText = card.querySelector('.movie-info p:nth-of-type(2)').textContent;
                    
                    if (category === 'Todas' || genreText.includes(category)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});