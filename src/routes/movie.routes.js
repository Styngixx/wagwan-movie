const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase'); 
const { getPeliculas, getPeliculaById } = require('../controllers/movie.controller.js');

// FIX 1: En Vercel no podemos guardar en disco local. Usamos la memoria (RAM) 
// temporalmente para luego subir el archivo a Supabase Storage.
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/peliculas', getPeliculas);
router.get('/peliculas/:id', getPeliculaById);

// 1. CREAR (POST)
router.post('/peliculas', upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, genero, anio, duracion, ranking } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'Falta imagen' });

        // FIX 2: Subimos la imagen a Supabase Storage
        const nombreArchivo = `${Date.now()}-${titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}${path.extname(req.file.originalname)}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media') // <-- Nombre del Bucket en Supabase
            .upload(nombreArchivo, req.file.buffer, {
                contentType: req.file.mimetype
            });

        if (uploadError) throw uploadError;

        // Obtenemos la URL pública de la imagen recién subida
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(nombreArchivo);
        const url_portada = publicUrlData.publicUrl;

        // Guardamos en la base de datos
        const { error } = await supabase.from('peliculas').insert([{ 
            titulo, genero, año_estreno: parseInt(anio), duracion, url_portada, ranking: parseInt(ranking), estado: 'Activo' 
        }]);
            
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Creada' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor al crear' }); 
    }
});

// 2. EDITAR TODO (PUT)
router.put('/peliculas/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, genero, anio, duracion, ranking } = req.body;
        
        let updateData = { 
            titulo, genero, año_estreno: parseInt(anio), duracion, ranking: parseInt(ranking) 
        };
        
        // Si el admin subió una foto nueva, la subimos a Supabase
        if (req.file) {
            const nombreArchivo = `${Date.now()}-${titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}${path.extname(req.file.originalname)}`;
            const { error: uploadError } = await supabase.storage.from('media').upload(nombreArchivo, req.file.buffer, { 
                contentType: req.file.mimetype 
            });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(nombreArchivo);
            updateData.url_portada = publicUrlData.publicUrl;
        }

        const { error } = await supabase.from('peliculas').update(updateData).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Actualizada' });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar' }); 
    }
});

// 3. CAMBIAR ESTADO O ELIMINAR (PATCH)
router.patch('/peliculas/:id/estado', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        const { error } = await supabase.from('peliculas').update({ estado }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// 4. CAMBIAR ESTADO DE VITRINAS (BANNERS Y TOPS)
router.patch('/peliculas/:id/vitrina', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { campo, estado } = req.body; 
        
        const { error } = await supabase.from('peliculas').update({ [campo]: estado }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error) { 
        res.status(500).json({ success: false }); 
    }
});

// FIX 3: El module.exports siempre debe ir EXACTAMENTE AL FINAL
module.exports = router;