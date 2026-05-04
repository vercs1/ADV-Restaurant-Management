const express = require('express');
const db = require("../config/db");
const router = express.Router();


router.get('/', (req, res) => {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status) {
        sql += ' WHERE status = ?';
        params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    db.query(sql, params, (err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        if (orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');
        const itemsSql = `
            SELECT oi.*, m.name as menu_name, m.image_url as menu_image_url
            FROM order_items oi
            JOIN menus m ON oi.menu_id = m.id
            WHERE oi.order_id IN (${placeholders})
            ORDER BY oi.order_id, oi.id
        `;

        db.query(itemsSql, orderIds, (err, items) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return res.status(500).json({ error: 'Failed to fetch order items' });
            }

            
            const itemsByOrder = {};
            items.forEach(item => {
                if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                }
                itemsByOrder[item.order_id].push(item);
            });

            
            const ordersWithItems = orders.map(order => ({
                ...order,
                items: itemsByOrder[order.id] || []
            }));

            res.json(ordersWithItems);
        });
    });
});


router.get('/:id', (req, res) => {
    const orderSql = 'SELECT * FROM orders WHERE id = ?';
    
    db.query(orderSql, [req.params.id], (err, orders) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ error: 'Failed to fetch order' });
        }

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];

        
        const itemsSql = `
            SELECT oi.*, m.name as menu_name, m.image_url as menu_image_url
            FROM order_items oi
            JOIN menus m ON oi.menu_id = m.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        `;

        db.query(itemsSql, [req.params.id], (err, items) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return res.status(500).json({ error: 'Failed to fetch order items' });
            }

            res.json({
                ...order,
                items: items
            });
        });
    });
});


router.post('/', (req, res) => {
    const { customer_name, customer_email, customer_phone, items } = req.body;

    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Customer name and at least one item are required' });
    }

    
    const menuIds = items.map(item => item.menu_id);
    const placeholders = menuIds.map(() => '?').join(',');
    const menuSql = `SELECT id, price, is_available FROM menus WHERE id IN (${placeholders})`;

    db.query(menuSql, menuIds, (err, menus) => {
        if (err) {
            console.error('Error validating menu items:', err);
            return res.status(500).json({ error: 'Failed to validate menu items' });
        }

        const menuMap = {};
        menus.forEach(menu => {
            menuMap[menu.id] = menu;
        });

        
        let total = 0;
        const validatedItems = [];

        for (const item of items) {
            if (!menuMap[item.menu_id]) {
                return res.status(400).json({ error: `Menu item ${item.menu_id} not found` });
            }
            if (!menuMap[item.menu_id].is_available) {
                return res.status(400).json({ error: `Menu item ${item.menu_id} is not available` });
            }
            const quantity = parseInt(item.quantity) || 1;
            const price = parseFloat(menuMap[item.menu_id].price);
            const subtotal = price * quantity;
            total += subtotal;

            validatedItems.push({
                menu_id: item.menu_id,
                quantity: quantity,
                price: price,
                subtotal: subtotal
            });
        }

        
        const orderSql = `
            INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status) 
            VALUES (?, ?, ?, ?, 'pending')
        `;
        db.query(orderSql, [customer_name, customer_email || null, customer_phone || null, total], (err, result) => {
            if (err) {
                console.error('Error creating order:', err);
                return res.status(500).json({ error: 'Failed to create order' });
            }

            const orderId = result.insertId;

            
            let itemsProcessed = 0;
            const insertNextItem = () => {
                if (itemsProcessed >= validatedItems.length) {
                    return res.status(201).json({ message: 'Order created', id: orderId });
                }

                const item = validatedItems[itemsProcessed];
                const itemSql = `
                    INSERT INTO order_items (order_id, menu_id, quantity, price, subtotal) 
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(itemSql, [orderId, item.menu_id, item.quantity, item.price, item.subtotal], (err) => {
                    if (err) {
                        console.error('Error creating order items:', err);
                        return res.status(500).json({ error: 'Failed to create order items' });
                    }
                    itemsProcessed++;
                    insertNextItem();
                });
            };

            insertNextItem();
        });
    });
});


router.put('/:id', (req, res) => {
    const { status, customer_name, customer_email, customer_phone } = req.body;
    
    const updates = [];
    const params = [];

    if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
    }
    if (customer_name !== undefined) {
        updates.push('customer_name = ?');
        params.push(customer_name);
    }
    if (customer_email !== undefined) {
        updates.push('customer_email = ?');
        params.push(customer_email);
    }
    if (customer_phone !== undefined) {
        updates.push('customer_phone = ?');
        params.push(customer_phone);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const sql = `UPDATE orders SET ${updates.join(', ')} WHERE id=?`;

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error updating order:', err);
            return res.status(500).json({ error: 'Failed to update order' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order updated' });
    });
});


router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM orders WHERE id=?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).json({ error: 'Failed to delete order' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted' });
    });
});

module.exports = router;
