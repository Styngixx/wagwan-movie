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
});