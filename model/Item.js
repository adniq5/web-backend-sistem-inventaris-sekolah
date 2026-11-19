const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama barang wajib diisi.'],
    trim: true,
    minlength: 2,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori barang wajib diisi.']
  },
  stock: {
    type: Number,
    required: [true, 'Stok barang wajib diisi.'],
    min: [0, 'Stok tidak boleh negatif.'],
    default: 0
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { versionKey: false });

itemSchema.index({ name: 1 });
itemSchema.index({ category: 1 });

module.exports = mongoose.model('Item', itemSchema);
