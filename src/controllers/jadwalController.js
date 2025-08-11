const prisma = require('../config/prismaClient');

// GET semua Jadwal Ibadah
exports.getAllJadwal = async (req, res) => {
  try {
    const jadwal = await prisma.jadwal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(jadwal);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

// GET Jadwal by ID
exports.getJadwalById = async (req, res) => {
  const { id } = req.params;
  try {
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!jadwal) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    res.json(jadwal);
  } catch (err) {
    console.error('Get Jadwal By ID Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data jadwal' });
  }
};

// CREATE Jadwal Ibadah
exports.createJadwal = async (req, res) => {
  try {
    const { judul, deskripsi, tanggal } = req.body;

    if (!judul || !deskripsi || !tanggal) {
      return res.status(400).json({ error: 'Judul, deskripsi, dan tanggal wajib diisi' });
    }

    const image = req.file ? `uploads/${req.file.filename}` : null;

    const jadwal = await prisma.jadwal.create({
      data: {
        judul,
        tanggal: new Date(tanggal),
        deskripsi,
        image,
        userId: req.user?.id, // dari token JWT
      },
    });

    res.status(201).json(jadwal);
  } catch (err) {
    console.error('Create Jadwal Error:', err);
    res.status(500).json({ error: 'Gagal menambahkan jadwal ibadah' });
  }
};

// UPDATE Jadwal Ibadah
exports.updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, tanggal } = req.body;

  try {
    const jadwalLama = await prisma.jadwal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!jadwalLama) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    const image = req.file ? `uploads/${req.file.filename}` : undefined;

    const updatedJadwal = await prisma.jadwal.update({
      where: { id: parseInt(id) },
      data: {
        judul,
        deskripsi,
        tanggal: new Date(tanggal),
        ...(image && { image }),
      },
    });

    res.json(updatedJadwal);
  } catch (err) {
    console.error('Update Jadwal Error:', err);
    res.status(500).json({ error: 'Gagal memperbarui jadwal ibadah' });
  }
};

// DELETE Jadwal Ibadah
exports.deleteJadwal = async (req, res) => {
  const { id } = req.params;

  try {
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: parseInt(id) }
    });

    if (!jadwal) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    await prisma.jadwal.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Jadwal ibadah berhasil dihapus' });
  } catch (err) {
    console.error('Delete Jadwal Error:', err);
    res.status(500).json({ error: 'Gagal menghapus jadwal ibadah' });
  }
};
