const express = require('express');
const router = express.Router();
const { getPeliculas, getPeliculaById } = require('../controllers/movie.controller.js');

router.get('/peliculas', getPeliculas);
router.get('/peliculas/:id', getPeliculaById);

module.exports = router;