require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Importamos tus archivos de rutas
const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3600;

app.use(cors());
app.use(express.json());

// 2. RUTAS DE LA API (Montadas correctamente en /api)
app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);

// 3. ARCHIVOS ESTÁTICOS (Frontend)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 4. RUTAS DE VISTAS FRONTEND
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

// El catch-all siempre al final
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// EXPORTACIÓN OBLIGATORIA PARA VERCEL
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Wagwan Mubi corriendo ready en http://localhost:${PORT}`);
    });
}