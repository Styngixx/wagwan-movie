document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = '/'; 
        return;
    }

    try {
        const response = await fetch('/api/peliculas'); 
        const cursos = await response.json();
        
        const curso = cursos.find(c => c.id == id);

        if (!curso) throw new Error("Curso no encontrado");

        // Rellenar cabecera y resumen
        document.getElementById('curso-titulo').textContent = curso.titulo;
        document.getElementById('curso-genero').textContent = `📚 ${curso.genero}`;
        document.getElementById('curso-anio').textContent = `📅 ${curso.año_estreno}`;
        document.getElementById('curso-resumen').textContent = curso.sinopsis || 'No hay un resumen disponible para esta sesión.';

        // === GESTIÓN DEL DOCUMENTO ADJUNTO ===
        const docWrapper = document.getElementById('document-wrapper');
        const docIframe = document.getElementById('curso-documento');
        const btnDescargar = document.getElementById('btn-descargar-doc');
        const btnVerLinea = document.getElementById('btn-ver-linea');
        
        const docUrl = curso.url_documento;

        if (docUrl && docUrl.trim() !== "") {
            docWrapper.style.display = 'block'; 
            btnDescargar.href = docUrl; 
            btnVerLinea.href = docUrl;

            // Si es PDF el navegador lo embebe directamente; si es Office usamos el visor en línea
            if (docUrl.toLowerCase().endsWith('.pdf')) {
                docIframe.src = docUrl;
            } else {
                docIframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(docUrl)}&embedded=true`;
            }
        } else {
            docWrapper.style.display = 'none';
        }

        // === GESTIÓN DEL REPRODUCTOR DE YOUTUBE ===
        const videoContainer = document.querySelector('.video-container');
        const videoUrl = curso.url_yt;

        if (videoUrl && videoUrl.trim() !== "") {
            let embedUrl = videoUrl;

            if (videoUrl.includes('watch?v=')) {
                const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (videoUrl.includes('youtu.be/')) {
                const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (videoUrl.includes('/shorts/')) {
                const videoId = videoUrl.split('/shorts/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            
            document.getElementById('curso-video').src = embedUrl;
        } else {
            videoContainer.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: var(--bg-secondary); color: var(--text-muted); font-weight: bold; border-radius: 12px; border: 1px dashed var(--border-light);">
                    Esta sesión no cuenta con un video grabado asignado.
                </div>
            `;
        }

    } catch (error) {
        console.error('Error al cargar la clase:', error);
        document.getElementById('curso-titulo').textContent = "Error al cargar la clase";
        document.getElementById('curso-resumen').textContent = "Hubo un problema al conectar con el servidor.";
    }
});