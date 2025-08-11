const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const {
  getAllTransaksi,
  getTransaksiById,
  createTransaksi,
  updateTransaksi,
  deleteTransaksi,
  getMonthlySummary,
  getLaporanBulanan, // ✅ untuk laporan cetak
} = require('../controllers/keuanganController');

const router = express.Router();

// Route khusus summary dan laporan DITARUH DI ATAS sebelum :id
router.get('/keuangan/summary/bulanan', verifyToken, getMonthlySummary);
router.get('/keuangan/laporan', verifyToken, getLaporanBulanan);

// CRUD Transaksi
router.get('/keuangan', verifyToken, getAllTransaksi);
router.get('/keuangan/:id', verifyToken, getTransaksiById);
router.post('/keuangan', verifyToken, createTransaksi);
router.put('/keuangan/:id', verifyToken, updateTransaksi);
router.delete('/keuangan/:id', verifyToken, deleteTransaksi);

module.exports = router;
