const prisma = require('../config/prismaClient');

// ===============================
// GET Semua Jemaat
// ===============================
exports.getAllJemaat = async (req, res) => {
  try {
    const data = await prisma.jemaat.findMany({
      orderBy: { tanggalLahir: 'desc' },
    });
    res.json(data);
  } catch (err) {
    console.error('Get All Jemaat Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data jemaat' });
  }
};

// ===============================
// GET Jemaat by ID
// ===============================
exports.getJemaatById = async (req, res) => {
  const { id } = req.params;
  try {
    const jemaat = await prisma.jemaat.findUnique({
      where: { id: parseInt(id) },
    });

    if (!jemaat) {
      return res.status(404).json({ error: 'Jemaat tidak ditemukan' });
    }

    res.json(jemaat);
  } catch (err) {
    console.error('Get Jemaat By ID Error:', err);
    res.status(500).json({ error: 'Gagal mengambil data jemaat' });
  }
};

// ===============================
// CREATE Jemaat
// ===============================
exports.createJemaat = async (req, res) => {
  try {
    const { namaLengkap, alamat, tanggalLahir, nomorHp, statusKeanggotaan } = req.body;

    if (!namaLengkap || !alamat || !tanggalLahir || !nomorHp) {
      return res.status(400).json({ error: 'Nama lengkap, alamat, tanggal lahir, dan nomor HP wajib diisi' });
    }

    const img = req.file ? `uploads/${req.file.filename}` : null;

    const jemaat = await prisma.jemaat.create({
      data: {
        namaLengkap,
        alamat,
        tanggalLahir: new Date(tanggalLahir),
        nomorHp,
        statusKeanggotaan: statusKeanggotaan === 'true' || statusKeanggotaan === true,
        img,
        userId: req.user?.id, // dari token JWT
      },
    });

    res.status(201).json(jemaat);
  } catch (err) {
    console.error('Create Jemaat Error:', err);
    res.status(500).json({ error: 'Gagal menambahkan jemaat' });
  }
};

// ===============================
// UPDATE Jemaat
// ===============================
exports.updateJemaat = async (req, res) => {
  const { id } = req.params;
  const { namaLengkap, alamat, tanggalLahir, nomorHp, statusKeanggotaan } = req.body;

  try {
    const jemaatLama = await prisma.jemaat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!jemaatLama) {
      return res.status(404).json({ error: 'Jemaat tidak ditemukan' });
    }

    const img = req.file ? `uploads/${req.file.filename}` : undefined;

    const updatedJemaat = await prisma.jemaat.update({
      where: { id: parseInt(id) },
      data: {
        namaLengkap,
        alamat,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : jemaatLama.tanggalLahir,
        nomorHp,
        statusKeanggotaan: statusKeanggotaan === 'true' || statusKeanggotaan === true,
        img: img || jemaatLama.img, // pakai gambar lama jika tidak ada upload baru
      },
    });

    res.json(updatedJemaat);
  } catch (err) {
    console.error('Update Jemaat Error:', err);
    res.status(500).json({ error: 'Gagal memperbarui jemaat' });
  }
};

// ===============================
// DELETE Jemaat
// ===============================
exports.deleteJemaat = async (req, res) => {
  const { id } = req.params;

  try {
    const jemaat = await prisma.jemaat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!jemaat) {
      return res.status(404).json({ error: 'Jemaat tidak ditemukan' });
    }

    await prisma.jemaat.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Jemaat berhasil dihapus' });
  } catch (err) {
    console.error('Delete Jemaat Error:', err);
    res.status(500).json({ error: 'Gagal menghapus jemaat' });
  }
};
