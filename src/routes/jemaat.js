const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const {
  getAllJemaat,
  getJemaatById,
  updateJemaat,
  deleteJemaat,
} = require('../controllers/jemaatController');

const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // multer

// 🔐 Middleware proteksi: hanya untuk SEKRETARIS & ADMIN
router.use(verifyToken, authorizeRoles('SEKRETARIS', 'ADMIN'));

// ===============================
// GET Semua Jemaat
// ===============================
router.get('/', getAllJemaat);

// ===============================
// GET Jemaat by ID (untuk edit)
// ===============================
router.get('/:id', getJemaatById);

// ===============================
// POST Jemaat Baru
// ===============================
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user?.id;

    if (!userId) return res.status(400).json({ error: 'User ID tidak ditemukan dalam token' });
    if (decoded.role !== 'SEKRETARIS') return res.status(403).json({ error: 'Forbidden' });

    const { namaLengkap, alamat, tanggalLahir, nomorHp, statusKeanggotaan } = req.body;
    const dateValue = new Date(tanggalLahir);
    if (isNaN(dateValue)) return res.status(400).json({ error: 'Format tanggal lahir tidak valid' });

    const imagePath = req.file ? `/uploads/jemaat/${req.file.filename}` : null;

    // Cek apakah user sudah punya jemaat (userId unique)
    const existingJemaat = await prisma.jemaat.findUnique({
      where: { userId }
    });
    if (existingJemaat) {
      return res.status(400).json({ error: 'User sudah memiliki data jemaat' });
    }

    const jemaat = await prisma.jemaat.create({
      data: {
        namaLengkap,
        alamat,
        tanggalLahir: dateValue,
        nomorHp,
        statusKeanggotaan: statusKeanggotaan === 'true' || statusKeanggotaan === true,
        img: imagePath,
        user: { connect: { id: userId } }
      }
    });

    res.status(201).json({ message: 'Jemaat berhasil ditambahkan', jemaat });
  } catch (error) {
    console.error('Error in jemaat creation:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// ===============================
// PUT /api/jemaat/:id - Update Jemaat
// ===============================
router.put('/:id', upload.single('img'), updateJemaat);

// ===============================
// DELETE /api/jemaat/:id - Hapus Jemaat
// ===============================
router.delete('/:id', deleteJemaat);

module.exports = router;
