const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Multer para recibir imagen y documento en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // Límite de 50MB
});

const uploadCampos = upload.fields([
    { name: 'imagen', maxCount: 1 },
    { name: 'documento', maxCount: 1 }
]);

// Valida que un campo de texto enviado por FormData tenga contenido real
function tieneValorTexto(valor) {
    if (valor === undefined || valor === null) return false;
    const texto = String(valor).trim();
    return texto !== '' && texto !== 'null' && texto !== 'undefined';
}

// === GET: OBTENER TODOS LOS CURSOS ===
router.get('/peliculas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('peliculas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error al listar cursos:', err);
        res.status(500).json({ error: err.message });
    }
});

// === POST: CREAR NUEVA CLASE / CURSO ===
router.post('/peliculas', uploadCampos, async (req, res) => {
    try {
        const { titulo, tipo, genero, anio, duracion, ranking, sinopsis, url_yt } = req.body;

        let url_portada = null;
        let url_documento = null;

        // Subir carátula si existe
        if (req.files && req.files['imagen']) {
            const imgFile = req.files['imagen'][0];
            const cleanImgName = `portadas/${Date.now()}_${imgFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

            const { error: errImg } = await supabase.storage
                .from('media')
                .upload(cleanImgName, imgFile.buffer, { contentType: imgFile.mimetype, upsert: true });

            if (errImg) throw errImg;
            url_portada = supabase.storage.from('media').getPublicUrl(cleanImgName).data.publicUrl;
        }

        // Subir material / documento si existe
        if (req.files && req.files['documento']) {
            const docFile = req.files['documento'][0];
            const cleanDocName = `documentos/${Date.now()}_${docFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

            const { error: errDoc } = await supabase.storage
                .from('media')
                .upload(cleanDocName, docFile.buffer, { contentType: docFile.mimetype, upsert: true });

            if (errDoc) throw errDoc;
            url_documento = supabase.storage.from('media').getPublicUrl(cleanDocName).data.publicUrl;
        }

        // Guardar registro en la base de datos
        const { data, error } = await supabase
            .from('peliculas')
            .insert([{
                titulo: tieneValorTexto(titulo) ? String(titulo).trim() : 'Sin título',
                tipo: tieneValorTexto(tipo) ? String(tipo).trim() : 'pelicula',
                genero: tieneValorTexto(genero) ? String(genero).trim() : 'General',
                año_estreno: tieneValorTexto(anio) && !Number.isNaN(parseInt(anio, 10)) ? parseInt(anio, 10) : new Date().getFullYear(),
                duracion: tieneValorTexto(duracion) && !Number.isNaN(parseInt(duracion, 10)) ? parseInt(duracion, 10) : 0,
                ranking: tieneValorTexto(ranking) && !Number.isNaN(parseInt(ranking, 10)) ? parseInt(ranking, 10) : 10,
                sinopsis: tieneValorTexto(sinopsis) ? String(sinopsis).trim() : '',
                url_yt: tieneValorTexto(url_yt) ? String(url_yt).trim() : null,
                url_portada: url_portada || '',
                url_documento: url_documento || null,
                estado: 'Activo',
                estado_banner: 'Ninguno',
                estado_top: 'Ninguno'
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: 'Curso registrado correctamente', data });
    } catch (err) {
        console.error('Error al guardar curso:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// === PUT: EDITAR CLASE / CURSO (BLINDADO CONTRA CAMPOS VACÍOS) ===
router.put('/peliculas/:id', uploadCampos, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, tipo, genero, anio, duracion, ranking, sinopsis, url_yt } = req.body;

        const updateData = {};

        // Solo actualiza los campos que realmente traen contenido nuevo
        if (tieneValorTexto(titulo)) updateData.titulo = String(titulo).trim();
        if (tieneValorTexto(tipo)) updateData.tipo = String(tipo).trim();
        if (tieneValorTexto(genero)) updateData.genero = String(genero).trim();
        if (tieneValorTexto(sinopsis)) updateData.sinopsis = String(sinopsis).trim();
        if (tieneValorTexto(url_yt)) updateData.url_yt = String(url_yt).trim();

        if (tieneValorTexto(anio) && !Number.isNaN(parseInt(anio, 10))) {
            updateData.año_estreno = parseInt(anio, 10);
        }
        if (tieneValorTexto(duracion) && !Number.isNaN(parseInt(duracion, 10))) {
            updateData.duracion = parseInt(duracion, 10);
        }
        if (tieneValorTexto(ranking) && !Number.isNaN(parseInt(ranking, 10))) {
            updateData.ranking = parseInt(ranking, 10);
        }

        // Si se subió un reemplazo de carátula
        if (req.files && req.files['imagen']) {
            const imgFile = req.files['imagen'][0];
            const cleanImgName = `portadas/${Date.now()}_${imgFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

            const { error: errImg } = await supabase.storage
                .from('media')
                .upload(cleanImgName, imgFile.buffer, { contentType: imgFile.mimetype, upsert: true });

            if (errImg) throw errImg;
            updateData.url_portada = supabase.storage.from('media').getPublicUrl(cleanImgName).data.publicUrl;
        }

        // Si se subió un reemplazo de documento
        if (req.files && req.files['documento']) {
            const docFile = req.files['documento'][0];
            const cleanDocName = `documentos/${Date.now()}_${docFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

            const { error: errDoc } = await supabase.storage
                .from('media')
                .upload(cleanDocName, docFile.buffer, { contentType: docFile.mimetype, upsert: true });

            if (errDoc) throw errDoc;
            updateData.url_documento = supabase.storage.from('media').getPublicUrl(cleanDocName).data.publicUrl;
        }

        // Si no hubo cambios nuevos, devuelve el registro actual sin tocar la BD
        if (Object.keys(updateData).length === 0) {
            const { data: currentData, error: fetchError } = await supabase
                .from('peliculas')
                .select('*')
                .eq('id', id);

            if (fetchError) throw fetchError;
            return res.json({ success: true, message: 'Curso actualizado con éxito', data: currentData });
        }

        const { data, error } = await supabase
            .from('peliculas')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, message: 'Curso actualizado con éxito', data });
    } catch (err) {
        console.error('Error al actualizar curso:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// === DELETE: ELIMINAR CURSO ===
router.delete('/peliculas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('peliculas')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Curso eliminado' });
    } catch (err) {
        console.error('Error al eliminar curso:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// === PATCH: CAMBIAR ESTADO BD (Activo / Suspendido) ===
router.patch('/peliculas/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const { error } = await supabase
            .from('peliculas')
            .update({ estado })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === PATCH: CONTROL VITRINAS (Banner / Top) ===
router.patch('/peliculas/:id/vitrina', async (req, res) => {
    try {
        const { id } = req.params;
        const { campo, estado } = req.body;
        const camposPermitidos = ['estado_banner', 'estado_top'];

        if (!camposPermitidos.includes(campo)) {
            return res.status(400).json({ error: 'Campo de vitrina no válido' });
        }

        const { error } = await supabase
            .from('peliculas')
            .update({ [campo]: estado })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;