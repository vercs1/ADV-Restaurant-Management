const express = require('express');
const db = require("../config/db");
const router = express.Router();


router.get('/order/:orderId', (req, res) => {
    const sql = `
        SELECT oi.*, m.name as menu_name, m.image_url as menu_image_url
        FROM order_items oi
        JOIN menus m ON oi.menu_id = m.id
        WHERE oi.order_id = ?
        ORDER BY oi.id
    `;
    db.query(sql, [req.params.orderId], (err, result) => {
        if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Failed to fetch order items' });
        }
        res.json(result);
    });
});


router.get('/:id', (req, res) => {
    const sql = `
        SELECT oi.*, m.name as menu_name, m.image_url as menu_image_url
        FROM order_items oi
        JOIN menus m ON oi.menu_id = m.id
        WHERE oi.id = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error fetching order item:', err);
            return res.status(500).json({ error: 'Failed to fetch order item' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }
        res.json(result[0]);
    });
});


router.post('/', (req, res) => {
    const { order_id, menu_id, quantity } = req.body;

    if (!order_id || !menu_id || !quantity) {
        return res.status(400).json({ error: 'Order ID, menu ID, and quantity are required' });
    }


    const menuSql = 'SELECT price, is_available FROM menus WHERE id = ?';
    db.query(menuSql, [menu_id], (err, menus) => {
        if (err) {
            console.error('Error fetching menu item:', err);
            return res.status(500).json({ error: 'Failed to fetch menu item' });
        }
        if (menus.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        if (!menus[0].is_available) {
            return res.status(400).json({ error: 'Menu item is not available' });
        }

        const price = parseFloat(menus[0].price);
        const qty = parseInt(quantity);
        const subtotal = price * qty;

        
        const itemSql = `
            INSERT INTO order_items (order_id, menu_id, quantity, price, subtotal) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(itemSql, [order_id, menu_id, qty, price, subtotal], (err, result) => {
            if (err) {
                console.error('Error creating order item:', err);
                return res.status(500).json({ error: 'Failed to create order item' });
            }

            
            const updateOrderSql = `
                UPDATE orders 
                SET total_amount = (
                    SELECT SUM(subtotal) FROM order_items WHERE order_id = ?
                )
                WHERE id = ?
            `;
            db.query(updateOrderSql, [order_id, order_id], (err) => {
                if (err) {
                    console.error('Error updating order total:', err);
                }
                res.status(201).json({ message: 'Order item added', id: result.insertId });
            });
        });
    });
});


router.put('/:id', (req, res) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Valid quantity is required' });
    }

    
    const getItemSql = 'SELECT order_id, price FROM order_items WHERE id = ?';
    db.query(getItemSql, [req.params.id], (err, items) => {
        if (err) {
            console.error('Error fetching order item:', err);
            return res.status(500).json({ error: 'Failed to fetch order item' });
        }
        if (items.length === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        const orderId = items[0].order_id;
        const price = parseFloat(items[0].price);
        const qty = parseInt(quantity);
        const subtotal = price * qty;

        
        const updateSql = 'UPDATE order_items SET quantity = ?, subtotal = ? WHERE id = ?';
        db.query(updateSql, [qty, subtotal, req.params.id], (err, result) => {
            if (err) {
                console.error('Error updating order item:', err);
                return res.status(500).json({ error: 'Failed to update order item' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order item not found' });
            }

            
            const updateOrderSql = `
                UPDATE orders 
                SET total_amount = (
                    SELECT SUM(subtotal) FROM order_items WHERE order_id = ?
                )
                WHERE id = ?
            `;
            db.query(updateOrderSql, [orderId, orderId], (err) => {
                if (err) {
                    console.error('Error updating order total:', err);
                }
                res.json({ message: 'Order item updated' });
            });
        });
    });
});


router.delete('/:id', (req, res) => {
    
    const getItemSql = 'SELECT order_id FROM order_items WHERE id = ?';
    db.query(getItemSql, [req.params.id], (err, items) => {
        if (err) {
            console.error('Error fetching order item:', err);
            return res.status(500).json({ error: 'Failed to fetch order item' });
        }
        if (items.length === 0) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        const orderId = items[0].order_id;

        
        const deleteSql = 'DELETE FROM order_items WHERE id = ?';
        db.query(deleteSql, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error deleting order item:', err);
                return res.status(500).json({ error: 'Failed to delete order item' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order item not found' });
            }

        
            const updateOrderSql = `
                UPDATE orders 
                SET total_amount = COALESCE((
                    SELECT SUM(subtotal) FROM order_items WHERE order_id = ?
                ), 0)
                WHERE id = ?
            `;
            db.query(updateOrderSql, [orderId, orderId], (err) => {
                if (err) {
                    console.error('Error updating order total:', err);
                }
                res.json({ message: 'Order item deleted' });
            });
        });
    });
});

module.exports = router;

