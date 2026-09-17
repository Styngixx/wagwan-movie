const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase'); 
const { getPeliculas, getPeliculaById } = require('../controllers/movie.controller.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'public', 'media')),
    filename: (req, file, cb) => {
        const nombreSlug = req.body.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-');
        cb(null, `${nombreSlug}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.get('/peliculas', getPeliculas);
router.get('/peliculas/:id', getPeliculaById);

// 1. CREAR (POST)
router.post('/peliculas', upload.single('imagen'), async (req, res) => {
    try {
        // FIX: Recibimos 'anio' sin la ñ para evitar que Multer lo vuelva null
        const { titulo, genero, anio, duracion, ranking } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'Falta imagen' });

        const url_portada = `/media/${req.file.filename}`;
        const { error } = await supabase.from('peliculas').insert([{ 
            titulo, genero, año_estreno: parseInt(anio), duracion, url_portada, ranking: parseInt(ranking), estado: 'Activo' 
        }]);
            
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Creada' });
    } catch (error) { res.status(500).json({ success: false }); }
});

// 2. EDITAR TODO (PUT)
router.put('/peliculas/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, genero, anio, duracion, ranking } = req.body;
        
        let updateData = { 
            titulo, genero, año_estreno: parseInt(anio), duracion, ranking: parseInt(ranking) 
        };
        // Si el admin subió una foto nueva, la actualizamos. Si no, se queda la anterior.
        if (req.file) updateData.url_portada = `/media/${req.file.filename}`;

        const { error } = await supabase.from('peliculas').update(updateData).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Actualizada' });
    } catch (error) { res.status(500).json({ success: false }); }
});

// 3. CAMBIAR ESTADO O ELIMINAR (PATCH)
router.patch('/peliculas/:id/estado', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'Activo', 'Suspendido' o 'Eliminado'
        const { error } = await supabase.from('peliculas').update({ estado }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

module.exports = router;


// 4. CAMBIAR ESTADO DE VITRINAS (BANNERS Y TOPS)
router.patch('/peliculas/:id/vitrina', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        // 'campo' será "estado_banner" o "estado_top", y 'estado' será "Activo", "Oculto" o "Ninguno"
        const { campo, estado } = req.body; 
        
        const { error } = await supabase.from('peliculas').update({ [campo]: estado }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error) { 
        res.status(500).json({ success: false }); 
    }
});