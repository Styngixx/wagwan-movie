document.addEventListener('DOMContentLoaded', () => {
    
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Inicializar el icono dependiendo de si el HTML tiene la clase dark-mode
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️'; // Mostrar sol porque estamos en oscuro
    } else {
        themeToggle.textContent = '🌙'; // Mostrar luna porque estamos en claro
    }
    
    // Cambiar de tema al hacer clic
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️'; 
            themeToggle.title = "Cambiar a Modo Claro";
        } else {
            themeToggle.textContent = '🌙';
            themeToggle.title = "Cambiar a Modo Oscuro";
        }
    });

    // Interactividad básica para la simulación
    const playButton = document.querySelector('.btn-primary');
    if (playButton) {
        playButton.addEventListener('click', () => {
            alert("▶ Iniciando película...");
        });
    }

    const episodeCards = document.querySelectorAll('.card-ep');
    episodeCards.forEach(card => {
        card.addEventListener('click', () => {
            alert("Cargando episodio...");
        });
    });

    // =========================================
// MODAL LOGIN ADMINISTRADOR
// =========================================

const adminDashboardLink = document.getElementById('adminDashboardLink');
const adminModal = document.getElementById('adminModal');
const adminModalClose = document.getElementById('adminModalClose');

if (adminDashboardLink && adminModal && adminModalClose) {

    // Abrir modal
    adminDashboardLink.addEventListener('click', (event) => {
        event.preventDefault();
        adminModal.classList.add('active');
    });

    // Cerrar con la X
    adminModalClose.addEventListener('click', () => {
        adminModal.classList.remove('active');
    });

    // Cerrar haciendo clic fuera de la ventana
    adminModal.addEventListener('click', (event) => {
        if (event.target === adminModal) {
            adminModal.classList.remove('active');
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            adminModal.classList.remove('active');
        }
    });
}

// =========================================
// VALIDAR LOGIN DEL ADMINISTRADOR
// =========================================

const adminLoginForm = document.getElementById('adminLoginForm');
const adminUsuario = document.getElementById('adminUsuario');
const adminPassword = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');

if (adminLoginForm) {

    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuarioIngresado = adminUsuario.value.trim();
        const passwordIngresado = adminPassword.value.trim();

        adminLoginError.textContent = '';

        try {

            const response = await fetch('public/data/admins.json');

            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de administradores');
            }

            const admins = await response.json();

            const adminValido = admins.find(admin =>
                admin.usuario === usuarioIngresado &&
                admin.password === passwordIngresado
            );

            if (adminValido) {

                // Guardamos temporalmente que el administrador inició sesión
                localStorage.setItem('adminLogged', 'true');

                adminLoginError.style.color = '#4ade80';
                adminLoginError.textContent = 'Acceso correcto';

                console.log('Administrador autenticado correctamente');

            } else {

                adminLoginError.style.color = '#ff6b6b';
                adminLoginError.textContent = 'Usuario o contraseña incorrectos';

            }

        } catch (error) {

            console.error(error);

            adminLoginError.style.color = '#ff6b6b';
            adminLoginError.textContent = 'Error al validar las credenciales';

        }
    });
}
});