const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/auth.controller');

// Ruta que recibirá las credenciales por POST
router.post('/login', loginAdmin);

module.exports = router;