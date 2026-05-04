Kalimot ko unsaon pag run, basta una kay backend then ang frontend 

Naa ra diay, wla na apil og push HAHHAHAHAHAHAHAH

Restaurant POS (POINT OF SALE) System


//Features

-  Menu Management - Add, edit, and manage menu items with categories
-  Point of Sale - Intuitive interface for taking orders
-  Order Management - Track and update order statuses
-  Modern UI - Beautiful, responsive design with Tailwind CSS
- Real-time Updates - Live cart updates and order tracking

Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Express.js, MySQL
- Database: MySQL with normalized schema

//Getting Started

Prerequisites

- Node.js 
- MySQL Server
- npm

1. Database Setup

First, set up your MySQL database:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=1Default Schema
PORT=5000
```

Then run the database setup script:

```bash
npm run setup-db
```

This will:
- Create the database if it doesn't exist
- Create all necessary tables (menus, orders, order_items, categories)
- Insert sample data

2. Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

3. Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm install

```

The frontend will run on `http://localhost:3000`

//Usage

POS Dashboard (`/`)
- Browse menu items by category
- Add items to cart
- Adjust quantities
- Checkout orders

Order Management (`/pages/orders`)
- View all orders
- Filter by status (pending, preparing, ready, completed, cancelled)
- Update order status
- Delete orders

Menu Management (`/pages/menu-management`)
- Add new menu items
- Edit existing items
- Toggle availability
- Delete items
- Manage categories

//API Endpoints

Menus
- `GET /api/menus` - Get all menu items
- `GET /api/menus/:id` - Get single menu item
- `GET /api/menus/categories` - Get all categories
- `POST /api/menus` - Create menu item
- `PUT /api/menus/:id` - Update menu item
- `DELETE /api/menus/:id` - Delete menu item

Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order with items
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

Order Items
- `GET /api/order-items/order/:orderId` - Get items for an order
- `POST /api/order-items` - Add item to order
- `PUT /api/order-items/:id` - Update order item
- `DELETE /api/order-items/:id` - Remove item from order

Project Structure

```
restaurant1/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── routes/
│   │   ├── menus.js           # Menu API routes
│   │   ├── orders.js          # Order API routes
│   │   └── order-items.js     # Order items API routes
│   ├── scripts/
│   │   └── setup-db.js        # Database setup script
│   └── server.js              # Express server
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.js                    # POS Dashboard
    │   │   └── pages/
    │   │       ├── orders/
    │   │       │   └── page.js            # Order Management
    │   │       └── menu-management/
    │   │           └── page.js            # Menu Management
    │   ├── components/
    │   │   ├── MenuCard.js                # Menu item card
    │   │   ├── OrderCart.js               # Shopping cart
    │   │   ├── OrderCard.js               # Order display card
    │   │   ├── CategoryTabs.js            # Category filter
    │   │   └── StatusBadge.js             # Status indicator
    │   └── lib/
    │       └── api.js                     # API client
    └── tailwind.config.js                 # Tailwind configuration
```

//Troubleshooting

Backend not connecting
- Ensure MySQL server is running
- Check `.env` file has correct database credentials
- Verify database was created: `npm run setup-db`

Frontend API errors
- Make sure backend server is running on port 5000
- Check browser console for detailed error messages
- Verify CORS is enabled in backend (it is by default)

Database errors
- Run `npm run setup-db` again to recreate tables
- Check MySQL server is running
- Verify database credentials in `.env` file

Next Steps / Future Enhancements

- [ ] User authentication and roles
- [ ] Payment processing integration
- [ ] Receipt printing
- [ ] Sales reports and analytics
- [ ] Table/reservation management
- [ ] Inventory tracking
- [ ] Staff management
- [ ] Real-time notifications
- [ ] Mobile app support


# ADV-Restaurant-Management
