// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Register
app.post('/api/tenant/register', async (req, res) => {
  const { name, email, phone, password, house_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const [existing] = await pool.query('SELECT * FROM Tenants WHERE Email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });
    await pool.query(
      'INSERT INTO Tenants (Name, Email, Phone, Password, House_ID) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, house_id]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/tenant/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM Tenants WHERE Email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.ID, email: user.Email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
    res.json({ token, tenant: { id: user.ID, name: user.Name, house_id: user.House_ID } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route
app.get('/api/tenant/dashboard', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT * FROM Payments WHERE Tenant_ID = ?', [decoded.id]);
    res.json({ payments: rows });
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Start server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));