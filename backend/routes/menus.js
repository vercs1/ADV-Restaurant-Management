const express = require('express');
const db = require("../config/db");
const router = express.Router();


router.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY display_order, name';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
        res.json(result);
    });
});


router.get('/', (req, res) => {
    const { category_id, available_only } = req.query;
    let sql = `
        SELECT m.*, c.name as category_name 
        FROM menus m 
        LEFT JOIN categories c ON m.category_id = c.id
    `;
    const conditions = [];
    const params = [];

    if (category_id) {
        conditions.push('m.category_id = ?');
        params.push(category_id);
    }

    if (available_only === 'true') {
        conditions.push('m.is_available = TRUE');
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY c.display_order, c.name, m.name';

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error fetching menus:', err);
            return res.status(500).json({ error: 'Failed to fetch menu items' });
        }
        res.json(result);
    });
});


router.get('/:id', (req, res) => {
    const sql = `
        SELECT m.*, c.name as category_name 
        FROM menus m 
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.id = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error fetching menu item:', err);
            return res.status(500).json({ error: 'Failed to fetch menu item' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(result[0]);
    });
});

router.post('/', (req, res) => {
    const { name, description, price, category_id, image_url, is_available } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    const sql = `
        INSERT INTO menus (name, description, price, category_id, image_url, is_available) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        name,
        description || null,
        price,
        category_id || null,
        image_url || null,
        is_available !== undefined ? is_available : true
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error creating menu item:', err);
            return res.status(500).json({ error: 'Failed to create menu item' });
        }
        res.status(201).json({ message: 'Menu item added', id: result.insertId });
    });
});

router.put('/:id', (req, res) => {
    const { name, description, price, category_id, image_url, is_available } = req.body;
    
    
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description || null);
    }
    if (price !== undefined) {
        updates.push('price = ?');
        params.push(price);
    }
    if (category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(category_id || null);
    }
    if (image_url !== undefined) {
        updates.push('image_url = ?');
        params.push(image_url || null);
    }
    if (is_available !== undefined) {
        updates.push('is_available = ?');
        params.push(is_available);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.params.id);
    const sql = `UPDATE menus SET ${updates.join(', ')} WHERE id = ?`;

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error updating menu item:', err);
            return res.status(500).json({ error: 'Failed to update menu item' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item updated' });
    });
});


router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM menus WHERE id=?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting menu item:', err);
            return res.status(500).json({ error: 'Failed to delete menu item' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted' });
    });
});

module.exports = router;
