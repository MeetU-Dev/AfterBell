const AdminAuditLog = require('../models/AdminAuditLog');

async function logAdminAction(adminUser, action, targetType, targetId, details = {}) {
  try {
    await AdminAuditLog.create({
      adminId: adminUser._id,
      adminName: adminUser.name,
      action,
      targetType,
      targetId: targetId ? String(targetId) : undefined,
      details,
    });
  } catch (err) {
    console.error('[audit] Failed to log:', err.message);
  }
}

module.exports = { logAdminAction };
