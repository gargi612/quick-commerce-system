const db = require('./config/db');

async function checkSchema() {
    try {
        const [orders] = await db.query('DESCRIBE Orders');
        console.log('----- ORDERS TABLE -----');
        console.table(orders);
        
        const [orderItems] = await db.query('DESCRIBE Order_Items');
        console.log('----- ORDER_ITEMS TABLE -----');
        console.table(orderItems);
    } catch (err) {
        console.error('Error describing tables:', err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
