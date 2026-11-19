const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Nama wajib diisi.'], trim: true, minlength: [2, 'Nama minimal 2 karakter.'] },
  email: { type: String, required: [true, 'Email wajib diisi.'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid.'] },
  password: { type: String, required: [true, 'Password wajib diisi.'], minlength: [8, 'Password minimal 8 karakter.'], select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
