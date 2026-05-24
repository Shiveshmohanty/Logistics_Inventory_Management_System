
-- Create database
CREATE DATABASE IF NOT EXISTS logitrack;
USE logitrack;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  department VARCHAR(100) NOT NULL,
  join_date DATE NOT NULL,
  last_active DATETIME NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  sku VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  last_updated DATETIME NOT NULL
);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  used_space INT NOT NULL DEFAULT 0,
  manager VARCHAR(100) NOT NULL,
  contact VARCHAR(100) NOT NULL,
  status ENUM('Active', 'Maintenance', 'Inactive') NOT NULL DEFAULT 'Active'
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address TEXT NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  status ENUM('New', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'New',
  total_amount DECIMAL(10, 2) NOT NULL,
  order_date DATE NOT NULL,
  last_updated DATETIME NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_number VARCHAR(50) NOT NULL UNIQUE,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'In Transit', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  estimated_delivery DATE NOT NULL,
  created_at DATETIME NOT NULL,
  last_updated DATETIME NOT NULL
);

-- Shipment Items Table
CREATE TABLE IF NOT EXISTS shipment_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- Insert default settings
INSERT INTO settings (name, value) VALUES
  ('companyName', 'LogiTrack'),
  ('lowStockThreshold', '10'),
  ('defaultCurrency', 'USD'),
  ('autoLogout', '60'),
  ('emailNotifications', 'false'),
  ('darkMode', 'false'),
  ('language', 'en');

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, department, join_date, last_active)
VALUES ('Admin User', 'admin@logitrack.com', '$2b$10$1JXiKFo5mhJZgYLmj5kzQ.KXlIEVKW9kRiS/bK4sMxDQU2Gf4z.Ua', 'admin', 'Management', '2023-01-01', NOW());
  