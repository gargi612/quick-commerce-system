const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getAllProductsAdmin,
    getProductById, 
    getProductsByCategory,
    createProduct,
    updateProduct 
} = require('../controllers/productController');

// User views (filtered by stock/expiry)
router.get('/', getProducts);
router.get('/admin', getAllProductsAdmin); // Unfiltered for Seller Dashboard
router.get('/:id', getProductById);
router.get('/category/:id', getProductsByCategory);

// Seller APIs
router.post('/', createProduct);
router.put('/:id', updateProduct);

module.exports = router;
