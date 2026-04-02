const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

// Route files
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json()); 

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

// Automate expiring products daily
const expireOutdatedStock = async () => {
    try {
        await db.query('UPDATE Products SET stock = 0 WHERE expiry_date < CURDATE()');
        console.log('Automated Stock Job: Expired products set to 0 stock strictly matching schema rules.');
    } catch (err) {
        console.error('Error auto-expiring stock:', err);
    }
};

app.get('/', (req, res) => {
    res.json({ message: "Quick Commerce Engine Running v2 (Users & Sellers)" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await expireOutdatedStock(); // Run stock enforcement strictly on start
    console.log(`Server is running securely on port ${PORT}`);
});
