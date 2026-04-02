const db = require('./config/db');

async function migrateDB() {
    try {
        console.log('Running Seller Upgrade Migrations...');

        // 1. Ensure Users table has role column
        try {
            await db.query("ALTER TABLE Users ADD COLUMN role ENUM('user','seller') DEFAULT 'user'");
            console.log("Added 'role' column to Users table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("'role' column already exists in Users.");
            else throw e;
        }

        // 2. Add Stock logic
        try {
            await db.query("ALTER TABLE Products ADD COLUMN stock INT DEFAULT 10");
            console.log("Added 'stock' column to Products table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("'stock' column already exists in Products.");
            else throw e;
        }

        // 3. Add Expiry logic
        try {
            await db.query("ALTER TABLE Products ADD COLUMN expiry_date DATE");
            console.log("Added 'expiry_date' column to Products table.");

            // Backfill existing products with a future expiry date so they don't instantly disappear
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            const dateStr = nextYear.toISOString().split('T')[0];
            await db.query("UPDATE Products SET expiry_date = ?", [dateStr]);
            console.log("Populated existing items with default future expiry dates.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("'expiry_date' column already exists in Products.");
            else throw e;
        }

        console.log("--- Database migrations successfully executed! ---");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit();
    }
}

migrateDB();
