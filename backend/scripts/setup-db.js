const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        console.log('Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });

        console.log('Connected to MySQL server!');

        const dbName = process.env.DB_NAME || 'restaurant';
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';

        
        console.log(`Creating database '${dbName}' if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✓ Database '${dbName}' is ready`);

        
        await connection.query(`USE \`${dbName}\``);

        
        console.log('Checking for existing tables...');
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('menus', 'orders', 'order_items', 'categories')
        `, [dbName]);

        const existingTables = tables.map(t => t.TABLE_NAME);
        const needsMigration = existingTables.length > 0;

        if (needsMigration) {
            console.log('⚠️  Existing tables found. Migrating schema...');
            console.log('   Note: This will drop existing tables and recreate them.');
            console.log('   All existing data will be lost. If you need to keep data, cancel now!');
            
            // Drop tables in correct order to handle foreign key constraints
            // Disable foreign key checks temporarily
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
            
            if (existingTables.includes('order_items')) {
                await connection.query('DROP TABLE IF EXISTS order_items');
                console.log('  ✓ Dropped old order_items table');
            }
            if (existingTables.includes('orders')) {
                await connection.query('DROP TABLE IF EXISTS orders');
                console.log('  ✓ Dropped old orders table');
            }
            if (existingTables.includes('menus')) {
                await connection.query('DROP TABLE IF EXISTS menus');
                console.log('  ✓ Dropped old menus table');
            }
            if (existingTables.includes('categories')) {
                await connection.query('DROP TABLE IF EXISTS categories');
                console.log('  ✓ Dropped old categories table');
            }
            
            // Re-enable foreign key checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('  ✓ Migration complete');
        }

        // Create tables if they don't exist
        console.log('Creating tables...');
        
        // Categories table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Categories table created');

        // Menus table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category_id INT,
                image_url VARCHAR(500),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log('✓ Menus table created');

        // Orders table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                total_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Orders table created');

        // Order items table (normalized)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                menu_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE RESTRICT
            )
        `);
        console.log('✓ Order items table created');

        // Insert sample categories
        console.log('Inserting sample categories...');
        await connection.query(`
            INSERT IGNORE INTO categories (id, name, display_order) VALUES
            (1, 'Beverages', 1),
            (2, 'Food', 2),
            (3, 'Desserts', 3),
            (4, 'Snacks', 4)
        `);
        console.log('✓ Sample categories inserted');

        // Insert sample menu items
        console.log('Inserting sample menu items...');
        await connection.query(`
            INSERT IGNORE INTO menus (id, name, description, price, category_id, image_url, is_available) VALUES
            (1, 'Cappuccino', 'Rich espresso with steamed milk and foam', 120.00, 1, NULL, TRUE),
            (2, 'Latte', 'Smooth espresso with steamed milk', 120.00, 1, NULL, TRUE),
            (3, 'Americano', 'Espresso with hot water', 100.00, 1, NULL, TRUE),
            (4, 'Mocha', 'Chocolate espresso with steamed milk', 130.00, 1, NULL, TRUE),
            (5, 'Tea', 'Hot tea selection', 80.00, 1, NULL, TRUE),
            (6, 'Iced Coffee', 'Cold brewed coffee', 110.00, 1, NULL, TRUE),
            (7, 'Sandwich', 'Fresh deli sandwich', 150.00, 2, NULL, TRUE),
            (8, 'Burger', 'Classic beef burger', 180.00, 2, NULL, TRUE),
            (9, 'Pasta', 'Italian pasta dish', 200.00, 2, NULL, TRUE),
            (10, 'Cake Slice', 'Assorted cake slices', 120.00, 3, NULL, TRUE),
            (11, 'Ice Cream', 'Premium ice cream', 100.00, 3, NULL, TRUE),
            (12, 'Chips', 'Crispy potato chips', 60.00, 4, NULL, TRUE)
        `);
        console.log('✓ Sample menu items inserted');

        console.log('\n✅ Database setup completed successfully!');
        console.log(`\nYou can now use these credentials in your .env file:`);
        console.log(`DB_HOST=${process.env.DB_HOST || 'localhost'}`);
        console.log(`DB_USER=${dbUser}`);
        console.log(`DB_PASSWORD=${dbPassword ? '***' : '(empty)'}`);
        console.log(`DB_NAME=${dbName}`);

    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Access denied. Please check your MySQL credentials.');
            console.error('   Make sure your .env file has the correct:');
            console.error('   - DB_USER (default: root)');
            console.error('   - DB_PASSWORD (your MySQL root password)');
            console.error('\n   If you don\'t know your MySQL root password, you may need to:');
            console.error('   1. Reset it, or');
            console.error('   2. Use MySQL Workbench or another GUI tool to access MySQL');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Cannot connect to MySQL server.');
            console.error('   Make sure MySQL is running on your system.');
            console.error('   You can start it from Services (services.msc) or XAMPP/WAMP control panel.');
        } else if (error.message.includes('category_id')) {
            console.error('\n💡 Schema migration error detected.');
            console.error('   The database has old tables that need to be migrated.');
            console.error('   The script will automatically drop and recreate tables.');
            console.error('   If you have important data, back it up first!');
            console.error('\n   To manually fix:');
            console.error('   1. Backup your data (if needed)');
            console.error('   2. Drop the database: DROP DATABASE restaurant;');
            console.error('   3. Run this script again: npm run setup-db');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();

