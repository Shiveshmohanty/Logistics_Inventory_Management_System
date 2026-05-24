
import express from 'express';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all warehouses
router.get('/', authenticate, async (req, res) => {
  try {
    const [warehouses] = await pool.query('SELECT * FROM warehouses ORDER BY name');
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Server error while fetching warehouses' });
  }
});

// Get a single warehouse by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [warehouses] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [req.params.id]);
    
    if (warehouses.length === 0) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    res.json(warehouses[0]);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ message: 'Server error while fetching warehouse' });
  }
});

// Create a new warehouse (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, location, capacity, usedSpace, manager, contact, status } = req.body;
    
    // Validate required fields
    if (!name || !location || !manager || !contact || !status || capacity === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Ensure usedSpace doesn't exceed capacity
    const actualUsedSpace = Math.min(usedSpace || 0, capacity);
    
    const [result] = await pool.query(
      'INSERT INTO warehouses (name, location, capacity, used_space, manager, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, location, capacity, actualUsedSpace, manager, contact, status]
    );
    
    const [newWarehouse] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newWarehouse[0]);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: 'Server error while creating warehouse' });
  }
});

// Update a warehouse (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, location, capacity, usedSpace, manager, contact, status } = req.body;
    const warehouseId = req.params.id;
    
    // Check if warehouse exists
    const [existingWarehouses] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [warehouseId]);
    
    if (existingWarehouses.length === 0) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    // Ensure usedSpace doesn't exceed capacity
    const actualUsedSpace = Math.min(usedSpace || 0, capacity);
    
    // Update warehouse
    await pool.query(
      'UPDATE warehouses SET name = ?, location = ?, capacity = ?, used_space = ?, manager = ?, contact = ?, status = ? WHERE id = ?',
      [name, location, capacity, actualUsedSpace, manager, contact, status, warehouseId]
    );
    
    const [updatedWarehouse] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [warehouseId]);
    
    res.json(updatedWarehouse[0]);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ message: 'Server error while updating warehouse' });
  }
});

// Delete a warehouse (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const warehouseId = req.params.id;
    
    // Check if warehouse exists
    const [existingWarehouses] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [warehouseId]);
    
    if (existingWarehouses.length === 0) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    // Check if warehouse is in use by products
    const [productsInWarehouse] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE location = ?',
      [existingWarehouses[0].name]
    );
    
    if (productsInWarehouse[0].count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete warehouse. It contains ${productsInWarehouse[0].count} products.` 
      });
    }
    
    // Delete warehouse
    await pool.query('DELETE FROM warehouses WHERE id = ?', [warehouseId]);
    
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ message: 'Server error while deleting warehouse' });
  }
});

export default router;
  