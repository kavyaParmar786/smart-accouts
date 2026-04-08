const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, adjustStock, getInventoryStats } = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

router.use(protect);
router.get('/stats', getInventoryStats);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', validate(schemas.product), createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/stock', adjustStock);

module.exports = router;
