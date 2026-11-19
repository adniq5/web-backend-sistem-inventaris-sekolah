require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const User = require('../model/User');
const Category = require('../model/Category');
const Item = require('../model/Item');

const existingCategoryId = '6ae1cdcfd9b7984d94a175cf';

const categorySeeds = [
  {
    name: 'Peralatan Kelas',
    description: 'Peralatan utama yang digunakan untuk kegiatan belajar mengajar.',
    items: [
      { name: 'Papan Tulis Putih', description: 'Papan tulis whiteboard untuk ruang kelas.', stock: 12 },
      { name: 'Meja Guru', description: 'Meja kerja untuk guru di ruang kelas.', stock: 10 },
      { name: 'Kursi Guru', description: 'Kursi kerja untuk guru di ruang kelas.', stock: 10 }
    ]
  },
  {
    name: 'Peralatan Laboratorium',
    description: 'Peralatan pendukung kegiatan praktikum sekolah.',
    items: [
      { name: 'Mikroskop Monokuler', description: 'Mikroskop untuk praktikum biologi dasar.', stock: 8 },
      { name: 'Gelas Ukur 100 ml', description: 'Gelas ukur untuk kegiatan praktikum.', stock: 20 },
      { name: 'Tabung Reaksi', description: 'Tabung reaksi kaca untuk percobaan laboratorium.', stock: 30 },
      { name: 'Neraca Digital', description: 'Neraca digital untuk mengukur massa bahan praktikum.', stock: 4 },
      { name: 'Bunsen Burner', description: 'Pembakar spiritus untuk pemanasan bahan praktikum.', stock: 10 }
    ]
  },
  {
    name: 'Peralatan Olahraga',
    description: 'Perlengkapan untuk kegiatan olahraga dan ekstrakurikuler.',
    items: [
      { name: 'Bola Sepak', description: 'Bola untuk latihan dan pertandingan sepak bola.', stock: 10 },
      { name: 'Bola Basket', description: 'Bola untuk latihan dan pertandingan bola basket.', stock: 8 },
      { name: 'Raket Bulutangkis', description: 'Raket untuk kegiatan olahraga bulutangkis.', stock: 12 },
      { name: 'Matras Senam', description: 'Matras untuk latihan senam dan kebugaran.', stock: 15 },
      { name: 'Net Voli', description: 'Net untuk lapangan bola voli sekolah.', stock: 3 }
    ]
  },
  {
    name: 'Perlengkapan Kebersihan',
    description: 'Perlengkapan untuk menjaga kebersihan lingkungan sekolah.',
    items: [
      { name: 'Sapu Lantai', description: 'Sapu untuk membersihkan lantai ruangan.', stock: 25 },
      { name: 'Pel Lantai', description: 'Alat pel untuk membersihkan lantai.', stock: 20 },
      { name: 'Tempat Sampah 60 Liter', description: 'Tempat sampah untuk area sekolah.', stock: 18 },
      { name: 'Ember Plastik', description: 'Ember untuk kebutuhan kebersihan sekolah.', stock: 15 },
      { name: 'Sikat Toilet', description: 'Sikat untuk membersihkan toilet sekolah.', stock: 12 }
    ]
  }
];

async function findSeedActor() {
  const actor = await User.findOne({ role: 'admin' }).select('_id');
  if (actor) return actor._id;

  const fallback = await User.findOne().select('_id');
  if (!fallback) {
    throw new Error('Seed membutuhkan minimal satu user pada database.');
  }

  return fallback._id;
}

async function ensureCategory(seed, actorId) {
  let category = await Category.findOne({ name: seed.name });
  if (!category && seed.name === 'Peralatan Kelas') {
    category = await Category.findById(existingCategoryId);
  }

  if (!category) {
    category = await Category.create({
      name: seed.name,
      description: seed.description,
      created_by: actorId,
      updated_by: actorId,
      created_at: new Date(),
      updated_at: new Date(),
      archived: false
    });
  }

  return category;
}

async function seedItems(category, items, actorId) {
  for (const itemSeed of items) {
    const existingItem = await Item.findOne({
      name: itemSeed.name,
      category: category._id
    });

    if (existingItem) continue;

    await Item.create({
      ...itemSeed,
      category: category._id,
      created_by: actorId,
      updated_by: actorId,
      created_at: new Date(),
      updated_at: new Date(),
      archived: false
    });
  }
}

async function seedInventory() {
  await connectDatabase();
  const actorId = await findSeedActor();

  for (const categorySeed of categorySeeds) {
    const category = await ensureCategory(categorySeed, actorId);
    await seedItems(category, categorySeed.items, actorId);
  }
}

async function main() {
  try {
    await seedInventory();
    console.log('Seed inventory selesai.');
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Seed inventory gagal:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { seedInventory };
