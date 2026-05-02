import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true
  },

  action: {
    type: String,
    enum: ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"],
    required: true
  },

  createdBy: {
    type: String, // email or userId
    required: true
  },

  previousState: {
    type: Object,
    default: null
  },

  newState: {
    type: Object,
    default: null
  }

}, { timestamps: true });

export default mongoose.model("AuditLog", auditLogSchema);
