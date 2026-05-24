
import express from 'express';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all orders
router.get('/', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, 
             c.name as customer_name, 
             c.email as customer_email, 
             c.address as customer_address 
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
    `);
    
    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.query(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items.map(item => ({
        productId: item.product_id,
        name: item.product_name || item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Format customer data
      order.customer = {
        name: order.customer_name,
        email: order.customer_email,
        address: order.customer_address
      };
      
      // Remove redundant fields
      delete order.customer_name;
      delete order.customer_email;
      delete order.customer_address;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Get a single order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, 
             c.name as customer_name, 
             c.email as customer_email, 
             c.address as customer_address 
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await pool.query(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);
    
    order.items = items.map(item => ({
      productId: item.product_id,
      name: item.product_name || item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Format customer data
    order.customer = {
      name: order.customer_name,
      email: order.customer_email,
      address: order.customer_address
    };
    
    // Remove redundant fields
    delete order.customer_name;
    delete order.customer_email;
    delete order.customer_address;
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// Create a new order (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderNumber, customer, items, status, totalAmount, orderDate } = req.body;
    
    // Validate required fields
    if (!orderNumber || !customer || !items || !items.length || !status || !totalAmount || !orderDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if customer exists, if not create them
      let customerId;
      const [existingCustomers] = await connection.query(
        'SELECT id FROM customers WHERE email = ?',
        [customer.email]
      );
      
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer information
        await connection.query(
          'UPDATE customers SET name = ?, address = ? WHERE id = ?',
          [customer.name, customer.address, customerId]
        );
      } else {
        // Create new customer
        const [customerResult] = await connection.query(
          'INSERT INTO customers (name, email, address) VALUES (?, ?, ?)',
          [customer.name, customer.email, customer.address]
        );
        customerId = customerResult.insertId;
      }
      
      // Insert order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (order_number, customer_id, status, total_amount, order_date, last_updated) VALUES (?, ?, ?, ?, ?, NOW())',
        [orderNumber, customerId, status, totalAmount, orderDate]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.productId || null, item.name, item.quantity, item.price]
        );
        
        // Update product quantity if product exists
        if (item.productId) {
          await connection.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }
      }
      
      await connection.commit();
      
      // Get the newly created order with items
      const [newOrders] = await pool.query(`
        SELECT o.*, 
               c.name as customer_name, 
               c.email as customer_email, 
               c.address as customer_address 
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `, [orderId]);
      
      const [orderItems] = await pool.query(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);
      
      const newOrder = newOrders[0];
      
      newOrder.items = orderItems.map(item => ({
        productId: item.product_id,
        name: item.product_name || item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Format customer data
      newOrder.customer = {
        name: newOrder.customer_name,
        email: newOrder.customer_email,
        address: newOrder.customer_address
      };
      
      // Remove redundant fields
      delete newOrder.customer_name;
      delete newOrder.customer_email;
      delete newOrder.customer_address;
      
      res.status(201).json(newOrder);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// Update an order (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { orderNumber, customer, items, status, totalAmount, orderDate } = req.body;
    const orderId = req.params.id;
    
    // Check if order exists
    const [existingOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    if (existingOrders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update customer information
      let customerId;
      const [existingCustomers] = await connection.query(
        'SELECT id FROM customers WHERE email = ?',
        [customer.email]
      );
      
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer information
        await connection.query(
          'UPDATE customers SET name = ?, address = ? WHERE id = ?',
          [customer.name, customer.address, customerId]
        );
      } else {
        // Create new customer
        const [customerResult] = await connection.query(
          'INSERT INTO customers (name, email, address) VALUES (?, ?, ?)',
          [customer.name, customer.email, customer.address]
        );
        customerId = customerResult.insertId;
      }
      
      // Update order
      await connection.query(
        'UPDATE orders SET order_number = ?, customer_id = ?, status = ?, total_amount = ?, order_date = ?, last_updated = NOW() WHERE id = ?',
        [orderNumber, customerId, status, totalAmount, orderDate, orderId]
      );
      
      // Get current order items to restore product quantities
      const [currentItems] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL',
        [orderId]
      );
      
      // Restore product quantities
      for (const item of currentItems) {
        if (item.product_id) {
          await connection.query(
            'UPDATE products SET quantity = quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
      
      // Delete existing order items
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      
      // Insert new order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.productId || null, item.name, item.quantity, item.price]
        );
        
        // Update product quantity if product exists
        if (item.productId) {
          await connection.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }
      }
      
      await connection.commit();
      
      // Get the updated order with items
      const [updatedOrders] = await pool.query(`
        SELECT o.*, 
               c.name as customer_name, 
               c.email as customer_email, 
               c.address as customer_address 
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `, [orderId]);
      
      const [orderItems] = await pool.query(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);
      
      const updatedOrder = updatedOrders[0];
      
      updatedOrder.items = orderItems.map(item => ({
        productId: item.product_id,
        name: item.product_name || item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Format customer data
      updatedOrder.customer = {
        name: updatedOrder.customer_name,
        email: updatedOrder.customer_email,
        address: updatedOrder.customer_address
      };
      
      // Remove redundant fields
      delete updatedOrder.customer_name;
      delete updatedOrder.customer_email;
      delete updatedOrder.customer_address;
      
      res.json(updatedOrder);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
});

// Delete an order (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Check if order exists
    const [existingOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    if (existingOrders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get order items with product IDs to restore quantities
      const [orderItems] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL',
        [orderId]
      );
      
      // Restore product quantities
      for (const item of orderItems) {
        if (item.product_id) {
          await connection.query(
            'UPDATE products SET quantity = quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }
      
      // Delete order items
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      
      // Delete order
      await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);
      
      await connection.commit();
      
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error while deleting order' });
  }
});

// Get pending orders count
router.get('/stats/pending', authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE status IN ("New", "Processing")'
    );
    
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    res.status(500).json({ message: 'Server error while fetching pending orders count' });
  }
});

export default router;
  