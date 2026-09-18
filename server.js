require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- Volvemos a requerir path
const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3600; 

app.use(cors());
app.use(express.json());

// 1. RUTAS DE LA API (Siempre van primero para que el frontend no las bloquee)
app.use('/api/peliculas', movieRoutes);
app.use('/api/auth', authRoutes);
// 1. RUTAS DE LA API
app.use('/api', movieRoutes); // <-- Quítale el "/peliculas" a esta línea
app.use('/api/auth', authRoutes);

// 2. ARCHIVOS ESTÁTICOS (Devolvemos esto para que tu local pueda ver el HTML/CSS/JS)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 3. CATCH-ALL FRONTEND (Cualquier ruta que no sea API, carga el index)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Exportar la app para Vercel
module.exports = app;

// Iniciar servidor local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
       console.log(`🚀 Servidor Wagwan Mubi corriendo ready en http://localhost:${PORT}`);
    });
}