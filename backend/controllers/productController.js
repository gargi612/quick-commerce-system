const db = require('../config/db');

// @desc    Get all available products (User view)
const getProducts = async (req, res) => {
    try {
        // STOCK LOGIC: Only show stock > 0 and not expired!
        const [products] = await db.query('SELECT * FROM Products WHERE stock > 0 AND expiry_date >= CURDATE()');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all products (Admin/Seller view)
const getAllProductsAdmin = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM Products ORDER BY product_id DESC');
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [product] = await db.query('SELECT * FROM Products WHERE product_id = ?', [id]);
        if (product.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: product[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.query('SELECT * FROM Products WHERE category_id = ? AND stock > 0 AND expiry_date >= CURDATE()', [id]);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- NEW SELLER APIs (Part 2) ---

// @desc    Add a new product (SELLER)
// @route   POST /api/products
const createProduct = async (req, res) => {
    try {
        const { category_id, product_name, price, stock, expiry_date, image_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO Products (category_id, product_name, price, stock, expiry_date, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [category_id || 1, product_name, price, stock || 10, expiry_date || null, image_url || '']
        );
        res.status(201).json({ success: true, message: 'Product created', productId: result.insertId });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

// @desc    Update product price, stock, expiry (SELLER)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, stock, expiry_date } = req.body;
        await db.query(
            'UPDATE Products SET price = ?, stock = ?, expiry_date = ? WHERE product_id = ?',
            [price, stock, expiry_date, id]
        );
        res.status(200).json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

module.exports = {
    getProducts,
    getAllProductsAdmin,
    getProductById,
    getProductsByCategory,
    createProduct,
    updateProduct
};
