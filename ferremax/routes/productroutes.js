const express = require('express');
const router = express.Router();
const productControllers = require('../controllers/productControllers');

// Consulta dinámica para cualquier tabla


router.get('tabla/:nombre', productControllers.getTabla);

// --- CRUD para /api/productos ---

router.get('/', productControllers.getAllProductos);
router.get('/id/:id', productControllers.getProductoById);
router.post('/', productControllers.createProducto);
router.put('/id/:id', productControllers.updateProducto);  
router.delete('/id/:id', productControllers.deleteProducto);


module.exports = router;
