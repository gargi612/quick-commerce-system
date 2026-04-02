const express = require('express');
const router = express.Router();
const { getPayments, updatePaymentStatus } = require('../controllers/paymentController');

router.get('/', getPayments);
router.put('/:id', updatePaymentStatus);

module.exports = router;
