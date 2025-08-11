const prisma = require('../config/prismaClient');

// Ambil semua transaksi keuangan
const getAllTransaksi = async (req, res) => {
  try {
    const data = await prisma.transaksiKeuangan.findMany({
      orderBy: { tanggal: 'desc' },
    });
    res.json(data);
  } catch (error) {
    console.error('Get All Transaksi Error:', error);
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
};

// Ambil transaksi berdasarkan ID
const getTransaksiById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transaksi = await prisma.transaksiKeuangan.findUnique({ where: { id } });

    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json(transaksi);
  } catch (error) {
    console.error('Gagal get transaksi by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Tambah pemasukan/pengeluaran
const createTransaksi = async (req, res) => {
  try {
    const { jenis, jumlah, keterangan, tanggal } = req.body;

    const transaksi = await prisma.transaksiKeuangan.create({
      data: {
        jenis,
        jumlah: parseFloat(jumlah),
        keterangan,
        tanggal: new Date(tanggal),
        userId: req.user.id, // asumsi middleware auth
      },
    });

    res.status(201).json(transaksi);
  } catch (error) {
    console.error('Create Transaksi Error:', error);
    res.status(500).json({ error: 'Gagal menambahkan transaksi' });
  }
};

// Update transaksi berdasarkan ID
const updateTransaksi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tanggal, keterangan, jumlah, jenis } = req.body;

    const updated = await prisma.transaksiKeuangan.update({
      where: { id },
      data: {
        tanggal: new Date(tanggal),
        keterangan,
        jumlah: parseFloat(jumlah),
        jenis,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Gagal update transaksi:', error);
    res.status(500).json({ message: 'Gagal memperbarui transaksi' });
  }
};

// Hapus transaksi berdasarkan ID
const deleteTransaksi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.transaksiKeuangan.delete({ where: { id } });
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Delete Transaksi Error:', error);
    res.status(500).json({ message: 'Gagal menghapus transaksi', error });
  }
};

// Ringkasan total seluruh pemasukan/pengeluaran
const getSummary = async (req, res) => {
  try {
    const pemasukan = await prisma.transaksiKeuangan.aggregate({
      where: { jenis: 'PEMASUKAN' },
      _sum: { jumlah: true },
    });

    const pengeluaran = await prisma.transaksiKeuangan.aggregate({
      where: { jenis: 'PENGELUARAN' },
      _sum: { jumlah: true },
    });

    const totalMasuk = pemasukan._sum.jumlah || 0;
    const totalKeluar = pengeluaran._sum.jumlah || 0;
    const saldoKas = totalMasuk - totalKeluar;

    res.json({ totalMasuk, totalKeluar, saldoKas });
  } catch (error) {
    console.error('Get Summary Error:', error);
    res.status(500).json({ error: 'Gagal menghitung ringkasan keuangan' });
  }
};

// Ringkasan keuangan bulanan (bisa pakai query string)
const getMonthlySummary = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    const now = new Date();
    const bulanInt = bulan ? parseInt(bulan) - 1 : now.getMonth();
    const tahunInt = tahun ? parseInt(tahun) : now.getFullYear();

    const firstDay = new Date(tahunInt, bulanInt, 1);
    const lastDay = new Date(tahunInt, bulanInt + 1, 0);

    const pemasukan = await prisma.transaksiKeuangan.aggregate({
      where: {
        jenis: 'PEMASUKAN',
        tanggal: { gte: firstDay, lte: lastDay }
      },
      _sum: { jumlah: true },
    });

    const pengeluaran = await prisma.transaksiKeuangan.aggregate({
      where: {
        jenis: 'PENGELUARAN',
        tanggal: { gte: firstDay, lte: lastDay }
      },
      _sum: { jumlah: true },
    });

    const kasAwal = 100000000; // bisa dibuat dinamis nanti
    const totalMasuk = pemasukan._sum.jumlah || 0;
    const totalKeluar = pengeluaran._sum.jumlah || 0;
    const totalKas = kasAwal + totalMasuk - totalKeluar;

    res.json({ totalMasuk, totalKeluar, totalKas });
  } catch (error) {
    console.error('Get Monthly Summary Error:', error);
    res.status(500).json({ error: 'Gagal mengambil ringkasan bulanan' });
  }
};

const getLaporanBulanan = async (req, res) => {
  try {
    const bulan = parseInt(req.query.bulan);
    const tahun = parseInt(req.query.tahun);

    // Validasi input
    if (isNaN(bulan) || isNaN(tahun) || bulan < 1 || bulan > 12) {
      return res.status(400).json({ message: 'Bulan dan tahun tidak valid' });
    }

    const startDate = new Date(tahun, bulan - 1, 1); // bulan - 1 karena index bulan dimulai dari 0
    const endDate = new Date(tahun, bulan, 1); // bulan berikutnya, tanggal 1

    const transaksi = await prisma.transaksiKeuangan.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { tanggal: 'asc' },
    });

    res.json(transaksi);
  } catch (error) {
    console.error('Gagal mengambil data laporan bulanan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data laporan' });
  }
};



module.exports = {
  getAllTransaksi,
  getTransaksiById,
  createTransaksi,
  updateTransaksi,
  deleteTransaksi,
  getSummary,
  getMonthlySummary,
  getLaporanBulanan, // ✅ untuk cetak laporan
};
