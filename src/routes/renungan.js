const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const {
  getAllRenungan,
  getRenunganById,
  updateRenungan,
  deleteRenungan,
} = require('../controllers/renunganController');

const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // multer

// 🔐 Middleware proteksi: hanya untuk SEKRETARIS & ADMIN
router.use(verifyToken, authorizeRoles('SEKRETARIS', 'ADMIN'));

// ===============================
// GET Semua Renungan
// ===============================
router.get('/', getAllRenungan);

// ===============================
// GET Renungan by ID (untuk edit)
// ===============================
router.get('/:id', getRenunganById);

// ===============================
// POST Renungan Baru
// ===============================
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user?.id;

    if (!userId) return res.status(400).json({ error: 'User ID tidak ditemukan dalam token' });
    if (decoded.role !== 'SEKRETARIS') return res.status(403).json({ error: 'Forbidden' });

    const { judul, isi, tanggal } = req.body;
    const dateValue = new Date(tanggal);
    if (isNaN(dateValue)) return res.status(400).json({ error: 'Format tanggal tidak valid' });

    const imagePath = req.file ? req.file.path : null;

    const renungan = await prisma.renungan.create({
      data: {
        judul,
        isi,
        tanggal: dateValue,
        img: imagePath,
        user: { connect: { id: userId } }
      }
    });

    res.status(201).json({ message: 'Renungan berhasil ditambahkan', renungan });
  } catch (error) {
    console.error('Error in renungan creation:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// ===============================
// PUT /api/renungan/:id - Update
// ===============================
router.put('/:id', upload.single('img'), updateRenungan);

// ===============================
// DELETE /api/renungan/:id - Hapus
// ===============================
router.delete('/:id', deleteRenungan);

module.exports = router;
