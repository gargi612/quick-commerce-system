const db = require('../config/db');

// @desc    Update delivery status (SELLER)
// @route   PUT /api/delivery/:id
const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params; // Using order_id inherently
        const { status } = req.body;
        
        try {
            const [result] = await db.query("UPDATE Deliveries SET delivery_status = ? WHERE order_id = ?", [status, id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Delivery record not found' });
            }
        } catch (e) {
            // Schema-agnostic safe-fail
            console.warn(`Delivery update hit fallback handler. Missing table/column mappings: ${e.message}`);
            return res.status(500).json({ success: false, message: 'Database schema error' });
        }
        res.status(200).json({ success: true, message: `Delivery successfully tagged as ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error updating delivery metric' });
    }
};

module.exports = { updateDeliveryStatus };
