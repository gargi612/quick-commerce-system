const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, getOrdersByUser } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/user/:user_id', getOrdersByUser); // Added user order fetching route
router.get('/:id', getOrderById);

module.exports = router;
