const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const {
  getAllJadwal,
  getJadwalById,
  updateJadwal,
  deleteJadwal
} = require('../controllers/jadwalController');

const upload = require('../middlewares/uploadMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Proteksi semua rute: hanya bisa diakses oleh SEKRETARIS dan ADMIN
router.use(verifyToken, authorizeRoles('SEKRETARIS', 'ADMIN'));

// ===============================
// GET semua jadwal ibadah
// ===============================
router.get('/', getAllJadwal);

// ===============================
// GET jadwal ibadah berdasarkan ID
// ===============================
router.get('/:id', getJadwalById);

// ===============================
// POST jadwal ibadah baru
// ===============================
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID tidak ditemukan dalam token' });

    const { judul, deskripsi, tanggal } = req.body;
    const dateValue = new Date(tanggal);
    if (isNaN(dateValue)) return res.status(400).json({ error: 'Format tanggal tidak valid' });

    const imagePath = req.file ? req.file.path : null;

    const jadwal = await prisma.jadwal.create({
      data: {
        judul,
        deskripsi,
        tanggal: dateValue,
        image: imagePath, // ✅ sesuai dengan schema Prisma
        user: { connect: { id: userId } }
      }
    });

    res.status(201).json({ message: 'Jadwal Ibadah berhasil ditambahkan', jadwal });
  } catch (error) {
    console.error('Error saat membuat jadwal:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// ===============================
// PUT jadwal ibadah
// ===============================
router.put('/:id', upload.single('image'), updateJadwal);

// ===============================
// DELETE jadwal ibadah
// ===============================
router.delete('/:id', deleteJadwal);

module.exports = router;
