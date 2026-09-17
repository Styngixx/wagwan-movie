require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes'); // <-- 1. IMPORTA ESTO

const app = express();
const PORT = process.env.PORT || 3600; 

app.use(cors());
app.use(express.json());

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes); // <-- 2. AGREGA ESTA LÍNEA

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Wagwan Mubi corriendo ready en http://localhost:${PORT}`);
});

// Al final de tu archivo principal del servidor:
module.exports = app;