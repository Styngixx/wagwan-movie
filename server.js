require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const movieRoutes = require('./src/routes/movie.routes');

const app = express();
// Veo en tu terminal que estás usando el puerto 3600
const PORT = process.env.PORT || 3600; 

// Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// EL FIX DE LOS ESTILOS E IMÁGENES ESTÁ AQUÍ 👇
// Le decimos a Express que si el HTML pide la ruta "/public/...", 
// lo busque directamente dentro de la carpeta 'public'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Y mantenemos la raíz normal para que el index.html principal cargue bien
app.use(express.static(path.join(__dirname, 'public')));
// -----------------------------------------------------

// Rutas de la API (Base de datos)
app.use('/api', movieRoutes);

// Catch-all: Redirigir cualquier otra ruta al index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Wagwan Mubi corriendo ready en http://localhost:${PORT}`);
});