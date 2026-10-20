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
app.use(express.static(path.join(__dirname, 'public')));

// 4. Vistas frontend
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.get('/detalle', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'detalle.html'));
});

// El catch-all siempre al final
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Wagwan corriendo en http://localhost:${PORT}`);
    });
}