document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el ID del curso de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = '/'; 
        return;
    }

    try {
        // 2. Traer los datos desde tu backend
        const response = await fetch('/api/peliculas'); 
        const cursos = await response.json();
        
        // 3. Buscar el curso exacto
        const curso = cursos.find(c => c.id == id);

        if (!curso) throw new Error("Curso no encontrado");

        // 4. Llenar los textos
        document.getElementById('curso-titulo').textContent = curso.titulo;
        document.getElementById('curso-genero').textContent = `📚 ${curso.genero}`;
        document.getElementById('curso-anio').textContent = `📅 ${curso.año_estreno}`;
        document.getElementById('curso-resumen').textContent = curso.sinopsis || 'Sin resumen disponible para esta clase.';

        // 5. LÓGICA DEL VIDEO YOUTUBE (EVITA EL CUADRO NEGRO)
        const videoContainer = document.querySelector('.video-container');
        let videoUrl = curso.url_yt;

        if (videoUrl && videoUrl.trim() !== "") {
            let embedUrl = videoUrl;
            
            // Convertir URL normal a formato "embed" para que el iframe lo acepte
            if (videoUrl.includes('watch?v=')) {
                const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (videoUrl.includes('youtu.be/')) {
                const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            
            document.getElementById('curso-video').src = embedUrl;
        } else {
            // Si la base de datos no tiene link, mostramos un mensaje en lugar del cuadro negro
            videoContainer.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: var(--bg-secondary); color: var(--text-muted); font-weight: bold; border-radius: 12px; border: 1px dashed var(--border-light);">
                    Aún no hay un video asignado a esta clase 😅
                </div>
            `;
        }

    } catch (error) {
        console.error('Error al cargar el curso:', error);
        document.getElementById('curso-titulo').textContent = "Error al cargar la clase";
        document.getElementById('curso-resumen').textContent = "Hubo un problema al conectar con el servidor.";
    }
});