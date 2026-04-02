const db = require('./config/db');

async function updateDB() {
    try {
        const [products] = await db.query('SELECT product_id, product_name FROM Products');
        
        let updateCount = 0;
        for (const product of products) {
            const name = (product.product_name || '').toLowerCase();
            
            let imgUrl = '';
            
            // Fixed mappings for known basic items
            if (name.includes('apple')) imgUrl = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('banana')) imgUrl = 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('milk')) imgUrl = 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('bread')) imgUrl = 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('potato')) imgUrl = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('egg')) imgUrl = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&q=80';
            else if (name.includes('onion')) imgUrl = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80';
            else {
                // NEW: Generate a completely unique grocery/food image for EVERY other product dynamically! 
                // We use loremflickr locked to the product_id so the image stays consistent per product but unique across products.
                imgUrl = `https://loremflickr.com/300/200/grocery,food/all?lock=${product.product_id}`;
            }

            await db.query('UPDATE Products SET image_url = ? WHERE product_id = ?', [imgUrl, product.product_id]);
            updateCount++;
        }
        console.log(`Successfully updated ${updateCount} products with UNIQUE images.`);
    } catch (e) {
        console.error('Fatal error updating DB:', e);
    } finally {
        process.exit(0);
    }
}

updateDB();
