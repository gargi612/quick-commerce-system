# Quick Commerce Management System

A database-driven **Quick Commerce Management System** developed as part of the **Database Management Systems (DBMS)** course.
The project simulates a real-world quick delivery platform where users can browse products, place orders, and track delivery, while sellers manage inventory, orders, and payments.

---

## Project Overview

Quick commerce is a modern form of e-commerce focused on delivering products such as groceries, beverages, medicines, and daily essentials in a short time.
This project demonstrates how **DBMS concepts** can be applied to build a structured and efficient commerce platform using a relational database.

The system manages:

* Product categories and subcategories
* Product inventory and expiry dates
* User and seller roles
* Store-based order processing
* Payment records
* Delivery assignment and tracking

---

## Objectives

The main objectives of this project are:

* To design and implement a **relational database** for a quick commerce platform
* To manage products, orders, payments, and deliveries efficiently
* To demonstrate the use of **ER modeling, relational schema, normalization, and SQL**
* To connect a **frontend and backend application** with a database system

---

## Features

### User Features

* View products by category and subcategory
* Browse available products
* Add items to cart
* Place orders
* View order details
* Track delivery status

### Seller Features

* Add and manage products
* Update stock and expiry dates
* View customer orders
* Update order and delivery status
* Manage payment records

### System Features

* Role-based login (**User / Seller**)
* Product inventory management
* Order and order item management
* Payment status tracking
* Delivery partner assignment
* Expiry-based product handling

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Tools / Libraries

* mysql2
* cors
* dotenv
* nodemon

---

## Project Structure

```bash
quick-commerce-system/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── deliveryController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── productController.js
│   ├── models/
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── productRoutes.js
│   ├── db_image_migration.js
│   ├── db_seller_migration.js
│   ├── schemaCheck.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── seller.html
│   ├── script.js
│   ├── seller.js
│   ├── style.css
│   └── seller.css
│
├── .gitignore
└── README.md
```

---

## Database Entities

The project is based on the following major entities:

* **Categories**
* **Subcategories**
* **Products**
* **Users**
* **Stores**
* **Orders**
* **Order Items**
* **Payments**
* **Delivery Partners**
* **Deliveries**

These entities are connected through **primary keys and foreign keys** to ensure data consistency and proper relational design.

---

## Functional Modules

### 1. Category and Subcategory Management

Products are organized into categories and subcategories to improve product browsing and filtering.

### 2. Product Management

The system stores product details such as:

* Product name
* Price
* Stock quantity
* Image URL
* Expiry date

### 3. User Management

The system supports different user roles:

* **User** → can browse and place orders
* **Seller** → can manage products and orders

### 4. Order Management

When a customer places an order:

* An order record is created
* Order items are stored separately
* Total order amount is recorded

### 5. Payment Management

Each order is linked to a payment record containing:

* Payment method
* Amount
* Payment status

### 6. Delivery Management

Orders are assigned to delivery partners and tracked using delivery status.

---

## Role-Based Workflow

### Customer Workflow

1. Login as **User**
2. Browse products
3. Add items to cart
4. Place order
5. Track delivery

### Seller Workflow

1. Login as **Seller**
2. Add / update products
3. Manage stock
4. View customer orders
5. Update delivery and payment status

---

## Database Design Concepts Used

This project applies the following DBMS concepts:

* Entity Relationship (ER) Modeling
* Relational Model
* Primary Keys
* Foreign Keys
* Normalization
* SQL Queries
* CRUD Operations
* Data Integrity Constraints
* One-to-Many and One-to-One Relationships

---

## How to Run the Project

## 1. Clone the Repository

```bash
git clone https://github.com/gargi612/quick-commerce-system.git
cd quick-commerce-system
```

---

## 2. Setup Backend

Move into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run the backend server:

```bash
npm start
```

Or use nodemon for development:

```bash
npm run dev
```

The backend will run on:

```bash
http://localhost:5000
```

---

## 3. Setup Database

Create a MySQL database and configure your `.env` file inside the `backend` folder.

### Create `.env` file:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
PORT=5000
```

---

## 4. Run Frontend

Open the frontend files in a browser or use **VS Code Live Server**.

Main pages:

* `login.html`
* `index.html`
* `seller.html`

---

## Sample API Endpoints

### Product Routes

* `GET /api/products`
* `POST /api/products`
* `PUT /api/products/:id`

### Category Routes

* `GET /api/categories`

### Order Routes

* `GET /api/orders`
* `POST /api/orders`

### Delivery Routes

* `PUT /api/delivery/:orderId`

### Payment Routes

* `GET /api/payments`
* `PUT /api/payments/:paymentId`

---

## Learning Outcomes

This project helped in understanding:

* How to design a structured database for a real-world system
* How relationships between entities are implemented
* How SQL and backend logic work together
* How CRUD operations are performed in a full-stack application
* How role-based systems are implemented in commerce applications

---

## Challenges Faced

Some of the key challenges faced during this project were:

* Designing relationships between multiple entities
* Managing order and payment workflows
* Updating delivery status dynamically
* Handling product stock and expiry logic
* Integrating frontend, backend, and database components

---

## Future Enhancements

The project can be improved further by adding:

* Proper user authentication and registration
* Real-time order tracking
* Search and sorting features
* Admin dashboard
* Online payment gateway integration
* Improved UI/UX
* Cloud deployment

---

## Conclusion

The **Quick Commerce Management System** is a practical implementation of **Database Management Systems concepts** in a real-world business scenario.
It demonstrates how a relational database can be used to efficiently manage products, users, orders, payments, and deliveries in an organized and scalable manner.

This project provided valuable experience in both **database design** and **application development**.

---

## Authors

**Project Members**

* Student 1 – Gargi Meena
* Student 2 – Shubhi Khandelwal
* Student 3 – Archit Jain

**Course:** Database Management Systems
**Academic Year:** 2025–26
**Institute:** SVKM’s NMIMS, School of Technology Management & Engineering, Indore

---

## GitHub Repository

[Quick Commerce Management System](https://github.com/gargi612/quick-commerce-system)

---

