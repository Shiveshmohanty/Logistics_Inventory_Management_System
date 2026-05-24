
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, department, join_date, last_active FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get a single user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Regular users can only view their own profile
    if (req.user.role !== 'admin' && req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const [users] = await pool.query(
      'SELECT id, name, email, role, department, join_date, last_active FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// Create a new user (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, joinDate } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role || !department || !joinDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, join_date, last_active) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, role, department, joinDate]
    );
    
    const [newUser] = await pool.query(
      'SELECT id, name, email, role, department, join_date, last_active FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// Update a user (admin only for other users)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Regular users can only update their own profile
    if (req.user.role !== 'admin' && userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email, password, role, department, joinDate } = req.body;
    
    // Only admins can change roles
    if (req.user.role !== 'admin' && role !== existingUsers[0].role) {
      return res.status(403).json({ message: 'Cannot change role without admin privileges' });
    }
    
    // Start building the update query
    let query = 'UPDATE users SET name = ?, email = ?, role = ?, department = ?, join_date = ?, last_active = NOW()';
    const params = [name, email, role, department, joinDate];
    
    // If password is provided, hash it and include in update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(userId);
    
    // Update user
    await pool.query(query, params);
    
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, role, department, join_date, last_active FROM users WHERE id = ?',
      [userId]
    );
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// Delete a user (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the last admin
    if (existingUsers[0].role === 'admin') {
      const [adminCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

export default router;
  