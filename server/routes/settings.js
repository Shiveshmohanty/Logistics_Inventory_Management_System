
import express from 'express';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', authenticate, async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings');
    
    // Convert settings array to object with name as key
    const settingsObject = settings.reduce((obj, setting) => {
      // Convert boolean strings to actual booleans
      if (setting.value === 'true' || setting.value === 'false') {
        obj[setting.name] = setting.value === 'true';
      }
      // Convert numeric strings to numbers
      else if (!isNaN(setting.value)) {
        obj[setting.name] = Number(setting.value);
      }
      // Keep strings as is
      else {
        obj[setting.name] = setting.value;
      }
      return obj;
    }, {});
    
    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error while fetching settings' });
  }
});

// Update settings (admin only)
router.put('/', authenticate, isAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update each setting
      for (const [name, value] of Object.entries(settings)) {
        // Convert value to string for storage
        const stringValue = typeof value === 'boolean' || typeof value === 'number'
          ? value.toString()
          : value;
        
        // Check if setting exists
        const [existingSetting] = await connection.query(
          'SELECT * FROM settings WHERE name = ?',
          [name]
        );
        
        if (existingSetting.length > 0) {
          // Update existing setting
          await connection.query(
            'UPDATE settings SET value = ? WHERE name = ?',
            [stringValue, name]
          );
        } else {
          // Insert new setting
          await connection.query(
            'INSERT INTO settings (name, value) VALUES (?, ?)',
            [name, stringValue]
          );
        }
      }
      
      await connection.commit();
      
      // Fetch updated settings
      const [updatedSettings] = await pool.query('SELECT * FROM settings');
      
      // Convert settings array to object with name as key
      const settingsObject = updatedSettings.reduce((obj, setting) => {
        // Convert boolean strings to actual booleans
        if (setting.value === 'true' || setting.value === 'false') {
          obj[setting.name] = setting.value === 'true';
        }
        // Convert numeric strings to numbers
        else if (!isNaN(setting.value)) {
          obj[setting.name] = Number(setting.value);
        }
        // Keep strings as is
        else {
          obj[setting.name] = setting.value;
        }
        return obj;
      }, {});
      
      res.json(settingsObject);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error while updating settings' });
  }
});

// Reset settings to default (admin only)
router.post('/reset', authenticate, isAdmin, async (req, res) => {
  try {
    // Default settings
    const defaultSettings = {
      companyName: 'LogiTrack',
      lowStockThreshold: 10,
      defaultCurrency: 'USD',
      autoLogout: 60,
      emailNotifications: false,
      darkMode: false,
      language: 'en'
    };
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Clear existing settings
      await connection.query('DELETE FROM settings');
      
      // Insert default settings
      for (const [name, value] of Object.entries(defaultSettings)) {
        await connection.query(
          'INSERT INTO settings (name, value) VALUES (?, ?)',
          [name, value.toString()]
        );
      }
      
      await connection.commit();
      
      res.json(defaultSettings);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Server error while resetting settings' });
  }
});

export default router;
  