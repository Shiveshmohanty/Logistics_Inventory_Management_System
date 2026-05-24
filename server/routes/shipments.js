
import express from 'express';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all shipments
router.get('/', authenticate, async (req, res) => {
  try {
    const [shipments] = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    
    // Get shipment items for each shipment
    for (const shipment of shipments) {
      const [items] = await pool.query(
        'SELECT name FROM shipment_items WHERE shipment_id = ?',
        [shipment.id]
      );
      shipment.items = items.map(item => item.name);
    }
    
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ message: 'Server error while fetching shipments' });
  }
});

// Get a single shipment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [shipments] = await pool.query('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    
    if (shipments.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    const shipment = shipments[0];
    
    // Get shipment items
    const [items] = await pool.query(
      'SELECT name FROM shipment_items WHERE shipment_id = ?',
      [shipment.id]
    );
    
    shipment.items = items.map(item => item.name);
    
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ message: 'Server error while fetching shipment' });
  }
});

// Create a new shipment (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { trackingNumber, origin, destination, status, estimatedDelivery, items } = req.body;
    
    // Validate required fields
    if (!trackingNumber || !origin || !destination || !status || !estimatedDelivery || !items || !items.length) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert shipment
      const [result] = await connection.query(
        'INSERT INTO shipments (tracking_number, origin, destination, status, estimated_delivery, created_at, last_updated) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [trackingNumber, origin, destination, status, estimatedDelivery]
      );
      
      const shipmentId = result.insertId;
      
      // Insert shipment items
      for (const item of items) {
        await connection.query(
          'INSERT INTO shipment_items (shipment_id, name) VALUES (?, ?)',
          [shipmentId, item]
        );
      }
      
      await connection.commit();
      
      // Get the newly created shipment with items
      const [newShipment] = await pool.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
      const [shipmentItems] = await pool.query('SELECT name FROM shipment_items WHERE shipment_id = ?', [shipmentId]);
      
      newShipment[0].items = shipmentItems.map(item => item.name);
      
      res.status(201).json(newShipment[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ message: 'Server error while creating shipment' });
  }
});

// Update a shipment (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { trackingNumber, origin, destination, status, estimatedDelivery, items } = req.body;
    const shipmentId = req.params.id;
    
    // Check if shipment exists
    const [existingShipments] = await pool.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
    
    if (existingShipments.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update shipment
      await connection.query(
        'UPDATE shipments SET tracking_number = ?, origin = ?, destination = ?, status = ?, estimated_delivery = ?, last_updated = NOW() WHERE id = ?',
        [trackingNumber, origin, destination, status, estimatedDelivery, shipmentId]
      );
      
      // Delete existing shipment items
      await connection.query('DELETE FROM shipment_items WHERE shipment_id = ?', [shipmentId]);
      
      // Insert new shipment items
      for (const item of items) {
        await connection.query(
          'INSERT INTO shipment_items (shipment_id, name) VALUES (?, ?)',
          [shipmentId, item]
        );
      }
      
      await connection.commit();
      
      // Get the updated shipment with items
      const [updatedShipment] = await pool.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
      const [shipmentItems] = await pool.query('SELECT name FROM shipment_items WHERE shipment_id = ?', [shipmentId]);
      
      updatedShipment[0].items = shipmentItems.map(item => item.name);
      
      res.json(updatedShipment[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ message: 'Server error while updating shipment' });
  }
});

// Delete a shipment (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const shipmentId = req.params.id;
    
    // Check if shipment exists
    const [existingShipments] = await pool.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
    
    if (existingShipments.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete shipment items
      await connection.query('DELETE FROM shipment_items WHERE shipment_id = ?', [shipmentId]);
      
      // Delete shipment
      await connection.query('DELETE FROM shipments WHERE id = ?', [shipmentId]);
      
      await connection.commit();
      
      res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ message: 'Server error while deleting shipment' });
  }
});

// Get shipment statistics
router.get('/stats/status-counts', authenticate, async (req, res) => {
  try {
    const [pendingCount] = await pool.query('SELECT COUNT(*) as count FROM shipments WHERE status = "Pending"');
    const [inTransitCount] = await pool.query('SELECT COUNT(*) as count FROM shipments WHERE status = "In Transit"');
    const [deliveredCount] = await pool.query('SELECT COUNT(*) as count FROM shipments WHERE status = "Delivered"');
    
    res.json({
      pending: pendingCount[0].count,
      inTransit: inTransitCount[0].count,
      delivered: deliveredCount[0].count
    });
  } catch (error) {
    console.error('Error fetching shipment statistics:', error);
    res.status(500).json({ message: 'Server error while fetching shipment statistics' });
  }
});

export default router;
  