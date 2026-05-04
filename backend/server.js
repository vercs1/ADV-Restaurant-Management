const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menus');
const orderRoutes = require('./routes/orders');
const orderItemRoutes = require('./routes/order-items');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
