const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pelaku aktivitas wajib diisi.']
  },
  action: {
    type: String,
    enum: [
      'login',
      'create_category',
      'create_item',
      'submit_loan',
      'approve_loan',
      'reject_loan',
      'submit_return',
      'verify_return',
      'external'
    ],
    required: function actionRequired() {
      return this.source !== 'external';
    }
  },
  activity_type: {
    type: String,
    trim: true,
    maxlength: [100, 'Jenis aktivitas maksimal 100 karakter.'],
    required: function activityTypeRequired() {
      return this.source === 'external';
    }
  },
  source: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal',
    required: [true, 'Sumber aktivitas wajib diisi.']
  },
  description: {
    type: String,
    required: [true, 'Deskripsi aktivitas wajib diisi.'],
    trim: true,
    maxlength: [500, 'Deskripsi aktivitas maksimal 500 karakter.']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false, collection: 'activity_logs' });

activityLogSchema.index({ created_at: -1 });
activityLogSchema.index({ actor: 1, created_at: -1 });
activityLogSchema.index({ action: 1, created_at: -1 });
activityLogSchema.index({ source: 1, created_at: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
