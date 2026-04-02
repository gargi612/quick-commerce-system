const express = require('express');
const router = express.Router();
const { updateDeliveryStatus } = require('../controllers/deliveryController');

router.put('/:id', updateDeliveryStatus);

module.exports = router;
