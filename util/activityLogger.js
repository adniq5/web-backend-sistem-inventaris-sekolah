const ActivityLog = require('../model/ActivityLog');

async function logActivity({ actor, action, description, metadata }) {
  try {
    await ActivityLog.create({ actor, action, description, metadata });
  } catch (error) {
    console.error('Aktivitas berhasil, tetapi gagal dicatat ke activity log:', error);
  }
}

module.exports = logActivity;
