import AuditLog from "../models/AuditLog.js";

const logAudit = async ({
  documentId,
  action,
  createdBy,
  previousState,
  newState
}) => {
  try {
    await AuditLog.create({
      documentId,
      action,
      createdBy,
      previousState,
      newState
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

export default logAudit;
