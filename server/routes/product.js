
import express from 'express';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', authenticate, async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// Get a single product by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// Create a new product (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, quantity, sku, location, category } = req.body;
    
    // Validate required fields
    if (!name || !sku || !location || !category || quantity === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO products (name, quantity, sku, location, category, last_updated) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, quantity, sku, location, category]
    );
    
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// Update a product (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, quantity, sku, location, category } = req.body;
    const productId = req.params.id;
    
    // Check if product exists
    const [existingProducts] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (existingProducts.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    await pool.query(
      'UPDATE products SET name = ?, quantity = ?, sku = ?, location = ?, category = ?, last_updated = NOW() WHERE id = ?',
      [name, quantity, sku, location, category, productId]
    );
    
    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// Delete a product (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const [existingProducts] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (existingProducts.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete product
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

// Get low stock items
router.get('/stats/low-stock', authenticate, async (req, res) => {
  try {
    // Get low stock threshold from settings
    const [settings] = await pool.query('SELECT value FROM settings WHERE name = "lowStockThreshold"');
    const threshold = settings.length > 0 ? parseInt(settings[0].value) : 10;
    
    const [products] = await pool.query('SELECT * FROM products WHERE quantity < ?', [threshold]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Server error while fetching low stock items' });
  }
});

export default router;
  