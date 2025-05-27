const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

// Obtener todos los usuarios (GET)
router.get('/usuarios', userControllers.getAllUsuarios);

// Registrar nuevo usuario (POST)
router.post('/usuarios', userControllers.createUsuario);

// Iniciar sesión (POST)
router.post('/usuarios/login', userControllers.loginUsuario);

module.exports = router;
