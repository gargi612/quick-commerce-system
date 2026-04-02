const db = require('../config/db');

// @desc    Get all payments (SELLER)
// @route   GET /api/payments
const getPayments = async (req, res) => {
    try {
        const [payments] = await db.query('SELECT * FROM Payments ORDER BY payment_id DESC');
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, data: [] });
    }
};

// @desc    Update payment status (SELLER)
// @route   PUT /api/payments/:id
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params; // Using payment_id
        const { status } = req.body;
        
        const [result] = await db.query("UPDATE Payments SET payment_status = ? WHERE payment_id = ?", [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }
        res.status(200).json({ success: true, message: `Payment successfully marked as ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating payment status' });
    }
};

module.exports = { getPayments, updatePaymentStatus };
