// backend/src/app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Routes
const authRoutes = require('./routes/auth');
const jadwalRoutes = require('./routes/jadwal'); // Import the route
const renunganRoutes = require('./routes/renungan');
const jemaatRoutes = require('./routes/jemaat');
const keuanganRoutes = require('./routes/keuangan');

// Gunakan routes
app.use('/api/auth', authRoutes);
app.use('/api/jadwal', jadwalRoutes); // Connect the route
app.use('/api/renungan', renunganRoutes);
app.use('/api/jemaat', jemaatRoutes);
app.use('/api', keuanganRoutes);
app.use('/uploads', express.static('uploads'));
// Endpoint default untuk cek server
app.get('/', (req, res) => {
  res.send('Sistem Informasi Gereja - Backend Aktif 🚀');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack); // Improved error logging
  res.status(500).json({ error: 'Internal Server Error' }); // Changed response format to JSON
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Export app untuk testing
module.exports = app;