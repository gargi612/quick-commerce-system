const db = require('../config/db');

// @desc    Create a new order & order items
const createOrder = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { user_id, store_id, total_amount, items } = req.body;

        if (!items || items.length === 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'No order items provided' });
        }

        await connection.beginTransaction();

        // STOCK LOGIC: Validate & Deduct simultaneously before placing order!
        for (const item of items) {
            const [productRows] = await connection.query('SELECT stock, expiry_date FROM Products WHERE product_id = ? FOR UPDATE', [item.product_id]);
            
            if (!productRows || productRows.length === 0) {
                throw new Error(`Product ID ${item.product_id} is missing from the database.`);
            }
            
            const prod = productRows[0];
            
            // Validation 1: Check Expiry Hard Stop
            if (prod.expiry_date && new Date(prod.expiry_date) < new Date()) {
                throw new Error(`Item ${item.product_id} has expired and cannot be sold.`);
            }
            // Validation 2: Check Stock Limit Hard Stop
            if (prod.stock < item.quantity) {
                throw new Error(`Insufficient stock for item ${item.product_id}. Available: ${prod.stock}`);
            }

            // Perform instantaneous reduction
            await connection.query('UPDATE Products SET stock = stock - ? WHERE product_id = ?', [item.quantity, item.product_id]);
        }

        const orderDate = new Date().toISOString().split('T')[0]; 
        
        // Use 'Pending' in 'status' dynamically if your column had it originally, else we just use our existing order mapping.
        // Earlier we saw you didn't have `status` natively in Orders table from DESCRIBE output... 
        // We will assume `status` was intentionally left off here in SQL schema check.
        // If the user wants Delivery Status later we can fetch from Delivery table or add. For now, matching the confirmed schema!
        const [orderResult] = await connection.query(
            'INSERT INTO Orders (user_id, store_id, total_amount, order_date) VALUES (?, ?, ?, ?)',
            [user_id, store_id, total_amount, orderDate]
        );
        const orderId = orderResult.insertId;

        const orderItemsValues = items.map(item => [orderId, item.product_id, item.quantity]);

        await connection.query(
            'INSERT INTO Order_Items (order_id, product_id, quantity) VALUES ?',
            [orderItemsValues]
        );

        await connection.query(
            "INSERT INTO Deliveries (order_id, delivery_status) VALUES (?, 'Order Placed')",
            [orderId]
        );

        // Record the payment logically in Payments table
        await connection.query(
            "INSERT INTO Payments (order_id, payment_method, amount, payment_status) VALUES (?, ?, ?, 'Pending')",
            [orderId, 'Cash on Delivery', total_amount] // Assuming COD as default fallback if not sent in req.body
        );

        await connection.commit();

        res.status(201).json({ success: true, message: 'Order created successfully. Stock deducted automagically.', orderId: orderId });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error. Contact Admin.' });
    } finally {
        connection.release();
    }
};

const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, d.delivery_status as status 
            FROM Orders o 
            LEFT JOIN Deliveries d ON o.order_id = d.order_id 
            ORDER BY o.order_id DESC
        `);
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false }); }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await db.query(`
            SELECT o.*, d.delivery_status as status 
            FROM Orders o 
            LEFT JOIN Deliveries d ON o.order_id = d.order_id 
            WHERE o.order_id = ?
        `, [id]);
        if (orders.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        const order = orders[0];
        
        const [items] = await db.query(`
            SELECT oi.order_item_id, oi.quantity, p.product_name, p.product_id, p.price
            FROM Order_Items oi JOIN Products p ON oi.product_id = p.product_id WHERE oi.order_id = ?
        `, [id]);
        order.items = items;

        res.status(200).json({ success: true, data: order });
    } catch (error) { res.status(500).json({ success: false }); }
};

const getOrdersByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [orders] = await db.query(`
            SELECT o.*, d.delivery_status as status 
            FROM Orders o 
            LEFT JOIN Deliveries d ON o.order_id = d.order_id 
            WHERE o.user_id = ? ORDER BY o.order_id DESC
        `, [user_id]);
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false }); }
};

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersByUser };
