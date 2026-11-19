const mongoose = require('mongoose');

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diisi pada file .env');
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'school_inventory' });
  console.log('Database MongoDB terhubung.');
}

module.exports = connectDatabase;
