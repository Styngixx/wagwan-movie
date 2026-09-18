require('dotenv').config();
const express = require('express');
const cors = require('cors');

const movieRoutes = require('./src/routes/movie.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3600; 

// Middlewares
app.use(cors());
app.use(express.json());

// Tus rutas de API (Esto es lo único que manejará Express en Vercel)
app.use('/api/peliculas', movieRoutes); // Sugerencia: ser específico con el endpoint
app.use('/api/auth', authRoutes);

// Exportar la app para Vercel
module.exports = app;

// Solo iniciamos el servidor si no estamos en el entorno de Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
       console.log(`Servidor Wagwan Mubi corriendo en http://localhost:${PORT}`);
    });
}