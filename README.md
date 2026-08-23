# Mini D-Mart — Premium Express Grocery Store Application

![Mini D-Mart Express](https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Highlights & Features

- **Full-Stack Single-Port Execution**: Java 21 Spring Boot 3 REST API backend serving an embedded, production-bundled Vite React Single Page Application on `http://localhost:8080`.
- **Relational PostgreSQL Database**: Automatic database table schema generation and data seeding with pre-configured stores, product categories, 20+ realistic products with imagery, and default user accounts.
- **Role-Based Access Control (RBAC)**: Secure JWT Authentication supporting three distinct roles:
  - `ROLE_CUSTOMER`: Browse products, live search/filter, cart management, place Store Pickup or Home Delivery orders, live status tracking timeline, cancel orders before prep, submit Return/Exchange requests.
  - `ROLE_STAFF`: Order fulfillment preparation queue, instant store pickup verification lookup by 6-digit code, status progression (`PLACED` -> `PREPARING` -> `READY_FOR_PICKUP` / `OUT_FOR_DELIVERY` -> `DELIVERED`), process return/exchange approvals with automated inventory restock.
  - `ROLE_ADMIN`: System KPI Executive Dashboard (Revenue, Orders, Customers, Low Stock Alerts), Product & Inventory CRUD Manager, User Role Editor, System Audit Logs.
- **Header Context Switcher**: Quick role switcher pill in the header allowing evaluators to instantly test the app from **Customer**, **Staff**, and **Admin** perspectives without manually signing out!
- **Glassmorphic Modern UI**: Built with custom HSL design tokens, Outfit typography, glassmorphism card layouts, smooth micro-interactions, responsive grid, animated toast notifications, and modals.

---

## 🔐 Pre-Seeded Test Credentials

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Admin** | `admin@minidmart.com` | `Admin@123` | Full System Control, Analytics, Inventory CRUD, Audit Logs, User Roles |
| **Staff** | `staff@minidmart.com` | `Staff@123` | Order Prep Queue, Pickup Code Verification Tool, Return Request Approvals |
| **Customer** | `customer@minidmart.com` | `Customer@123` | Product Shopping, Cart, Checkout, Order Tracking, Return/Exchange Requests |

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Spring Boot 3.3.4, Java 21
- **Database**: PostgreSQL 18 (`jdbc:postgresql://localhost:5432/mini_dmart`)
- **ORM / Persistence**: Spring Data JPA & Hibernate ORM
- **Security**: Spring Security 6, JJWT 0.12.6, BCrypt Password Encoder
- **Frontend**: React 18, Vite 5, Lucide Icons, Glassmorphic Vanilla CSS
- **Build Tools**: Apache Maven (`./mvnw.cmd`), NPM

---

## 📊 Database Schema / ERD Overview

- `users`: `id`, `full_name`, `email` (unique), `password` (BCrypt), `role` (`ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN`), `phone`, `address`, `created_at`
- `categories`: `id`, `name`, `slug`, `description`, `image_url`
- `products`: `id`, `name`, `description`, `sku` (unique), `category_id`, `price`, `original_price`, `unit`, `image_url`, `stock_quantity`, `low_stock_threshold`, `is_available`, `created_at`
- `cart_items`: `id`, `user_id`, `product_id`, `quantity`
- `store_locations`: `id`, `name`, `address`, `operating_hours`, `contact_phone`, `active`
- `orders`: `id`, `order_number` (unique), `user_id`, `order_type` (`HOME_DELIVERY`, `STORE_PICKUP`), `status` (`PLACED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`), `store_location_id`, `delivery_address`, `delivery_time_slot`, `pickup_code`, `subtotal_amount`, `delivery_fee`, `tax_amount`, `total_amount`, `notes`, `created_at`, `updated_at`
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`
- `return_exchange_requests`: `id`, `request_number`, `order_id`, `order_item_id`, `request_type` (`RETURN`, `EXCHANGE`), `quantity`, `reason`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `PROCESSED`), `admin_notes`, `requested_at`, `processed_at`
- `audit_logs`: `id`, `user_email`, `action`, `entity_name`, `entity_id`, `details`, `timestamp`

---

## ⚡ Quick Start Guide

### Prerequisites
- Java 21 JDK
- PostgreSQL 18 running on port 5432 with user `postgres` and password `Darshan`
- Node.js & NPM

### Setup & Run Instructions

1. **Verify PostgreSQL Database**:
   Create database `mini_dmart` (or let Spring Data auto-create table schemas).
   ```bash
   psql -U postgres -c "CREATE DATABASE mini_dmart;"
   ```

2. **Build Frontend Production Bundle** (optional, already pre-built in `src/main/resources/static`):
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. **Run Spring Boot Application**:
   ```bash
   mvnw spring-boot:run
   ```

4. **Access the Application**:
   Open browser at [http://localhost:8080](http://localhost:8080).

---

## 📡 Key REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register customer account
- `POST /api/auth/login` — Authenticate user & issue JWT token
- `GET /api/auth/me` — Get current user profile

### Products & Store Locations
- `GET /api/products` — List products (supports `categoryId` & `search` query parameters)
- `GET /api/products/{id}` — Get single product details
- `GET /api/categories` — List categories
- `GET /api/stores` — List active store branches for pickup

### Cart & Orders (Authenticated Customer)
- `GET /api/cart` — View active user cart
- `POST /api/cart/add` — Add item to cart with stock validation
- `PUT /api/cart/{id}` — Update item quantity
- `DELETE /api/cart/{id}` — Remove item from cart
- `POST /api/orders` — Place order (Store Pickup or Home Delivery)
- `GET /api/orders/my-orders` — View order history with live status
- `POST /api/orders/{id}/cancel` — Cancel order before preparation (restocks inventory)

### Returns & Exchanges (Authenticated Customer)
- `POST /api/returns` — Submit return/exchange request (within 7 days of delivery)
- `GET /api/returns/my-requests` — View submitted return requests

### Staff Portal (ROLE_STAFF / ROLE_ADMIN)
- `GET /api/staff/orders` — Order preparation queue
- `GET /api/staff/orders/pickup/{pickupCode}` — Verify 6-digit store pickup code
- `PUT /api/staff/orders/{id}/status` — Update order lifecycle status
- `GET /api/staff/returns` — View return request queue
- `PUT /api/staff/returns/{id}/process` — Approve/Reject return (auto-restocks stock on approval)

### Admin Management (ROLE_ADMIN)
- `GET /api/admin/dashboard` — System KPI metrics
- `GET /api/admin/users` — List registered users
- `PUT /api/admin/users/{id}/role` — Change user role
- `POST /api/admin/products` — Create product
- `PUT /api/admin/products/{id}` — Update product & stock levels
- `DELETE /api/admin/products/{id}` — Delete product
- `GET /api/admin/audit-logs` — Track administrative & system security events
