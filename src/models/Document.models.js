import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  approver: { type: String, required: true }, // email or userId
  status: {
    type: String,
    enum: ["DRAFT", "APPROVED", "REJECTED", "IN_REVIEW"],
    default: "DRAFT"
  }
});

const approvalStepSchema = new mongoose.Schema({
  stepOrder: Number, // sequence
  isParallel: { type: Boolean, default: false },
  approvers: [approvalSchema]
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  approvalWorkflow: [approvalStepSchema],
  currentStep: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"],
    default: "DRAFT"
  }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
