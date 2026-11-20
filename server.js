require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Importación de rutas
const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3600;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Rutas de la API
app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);

// 3. Archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));

// 4. Redirigir vistas al Frontend en Angular cuando corre en Vercel
app.get(/.*/, (req, res) => {
    if (process.env.VERCEL) {
        return res.redirect('https://wagwan-moviex.vercel.app');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Wagwan corriendo en http://localhost:${PORT}`);
    });
}