require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3600;

app.use(cors());
app.use(express.json());

// 1. RUTAS DE LA API (Montadas en /api para coincidir con /api/peliculas y /api/auth)
app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);

// 2. ARCHIVOS ESTÁTICOS
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 3. ENRUTAMIENTO SPA / FRONTEND
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Exportar la instancia para Vercel Serverless Functions
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Wagwan Mubi corriendo ready en http://localhost:${PORT}`);
    });
}