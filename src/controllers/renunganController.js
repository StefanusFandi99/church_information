const prisma = require('../config/prismaClient');

// ===============================
// GET Semua Renungan
// ===============================
exports.getAllRenungan = async (req, res) => {
  try {
    const data = await prisma.renungan.findMany({
      orderBy: { tanggal: 'desc' },
    });
    res.json(data);
  } catch (err) {
    console.error('Get All Renungan Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data renungan' });
  }
};

// ===============================
// GET Renungan by ID
// ===============================
exports.getRenunganById = async (req, res) => {
  const { id } = req.params;
  try {
    const renungan = await prisma.renungan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!renungan) {
      return res.status(404).json({ error: 'Renungan tidak ditemukan' });
    }

    res.json(renungan);
  } catch (err) {
    console.error('Get Renungan By ID Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data renungan' });
  }
};

// ===============================
// CREATE Renungan
// ===============================
exports.createRenungan = async (req, res) => {
  try {
    const { judul, isi, tanggal } = req.body;

    if (!judul || !isi || !tanggal) {
      return res.status(400).json({ error: 'Judul, isi, dan tanggal wajib diisi' });
    }

    const img = req.file ? `uploads/${req.file.filename}` : null;

    const renungan = await prisma.renungan.create({
      data: {
        judul,
        isi,
        tanggal: new Date(tanggal),
        img,
        userId: req.user?.id, // dari token JWT
      },
    });

    res.status(201).json(renungan);
  } catch (err) {
    console.error('Create Renungan Error:', err);
    res.status(500).json({ error: 'Gagal menambahkan renungan' });
  }
};

// ===============================
// UPDATE Renungan
// ===============================
exports.updateRenungan = async (req, res) => {
  const { id } = req.params;
  const { judul, isi, tanggal } = req.body;

  try {
    const renunganLama = await prisma.renungan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!renunganLama) {
      return res.status(404).json({ error: 'Renungan tidak ditemukan' });
    }

    const img = req.file ? `uploads/${req.file.filename}` : undefined;

    const updatedRenungan = await prisma.renungan.update({
      where: { id: parseInt(id) },
      data: {
        judul,
        isi,
        tanggal: new Date(tanggal),
        ...(img && { img }),
      },
    });

    res.json(updatedRenungan);
  } catch (err) {
    console.error('Update Renungan Error:', err);
    res.status(500).json({ error: 'Gagal memperbarui renungan' });
  }
};

// ===============================
// DELETE Renungan
// ===============================
exports.deleteRenungan = async (req, res) => {
  const { id } = req.params;

  try {
    const renungan = await prisma.renungan.findUnique({
      where: { id: parseInt(id) }
    });

    if (!renungan) {
      return res.status(404).json({ error: 'Renungan tidak ditemukan' });
    }

    await prisma.renungan.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Renungan berhasil dihapus' });
  } catch (err) {
    console.error('Delete Renungan Error:', err);
    res.status(500).json({ error: 'Gagal menghapus renungan' });
  }
};
