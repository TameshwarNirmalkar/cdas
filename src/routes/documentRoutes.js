import express from "express";
import DocumentModel from "../models/Document.models.js";
import logAudit from "../utils/auditLogger.js";
import AuditLog from "../models/AuditLog.js";

const documentsRouter = express.Router();
/**
 * Create Document with Workflow
 * @route POST /documents/create
 * @desc Create a new document with a workflow
 * @access Public
 * @param {Object} req.body - The request body containing the title, content, and workflow
 * @returns {Object} The document
 * @throws {Error} If the document is not created
 * @throws {Error} If the audit log is not created
 * @throws {Error} If the document is not saved
 * @throws {Error} If the workflow is not formatted correctly
 */
documentsRouter.post("/create", async (req, res) => {
  try {
    const { title, content, workflow, email } = req.body;
    // workflow format example:
    // [
    //   { stepOrder: 1, isParallel: false, approvers: [{approver: "finance.head@company.com"}] },
    //   { stepOrder: 2, isParallel: true, approvers: [{approver: "finance.head@company.com"}, {approver: "legal.head@company.com"}] }
    // ]
    const formattedWorkflow = workflow.map(step => ({
      stepOrder: step.stepOrder,
      isParallel: step.isParallel || false,
      approvers: step.approvers.map(a => ({
        approver: a
      }))
    }));

    const doc = new DocumentModel({
      title,
      content,
      approvalWorkflow: formattedWorkflow,
      status: "DRAFT",
    });

    await doc.save();

    await logAudit({
      documentId: doc._id,
      action: "DRAFT",
      createdBy: email,
      previousState: null,
      newState: doc
    });

    res.json({ message: "Document created", data: doc });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * Approve / Reject Step
 * @route POST /documents/:id/action
 * @desc Approve or reject a step in the document
 * @access Public
 * @param {string} id - The ID of the document
 * @param {Object} req.body - The request body containing the action and approver email
 * @returns {Object} The document
 * @throws {Error} If the document is not found
 * @throws {Error} If the approver is not found
 * @throws {Error} If the action is not valid
 * @throws {Error} If the document is not saved
 * @throws {Error} If the audit log is not created
 */
documentsRouter.post("/:id/action", async (req, res) => {
  try {
    const { action, approverEmail } = req.body;

    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: "Document not found." });

    const currentStep = doc.approvalWorkflow[doc.currentStep];

    const approver = currentStep.approvers.find( a => a.approver === approverEmail );

    if (!approver) {
      return res.status(403).json({ msg: "Not assigned to you." });
    }

    approver.status = action; // approved or rejected

    if (action === "REJECTED") {
      doc.status = "REJECTED";
      await doc.save();
      return res.json({ msg: "Document rejected." });
    }

    // Check step completion
    const allApproved = currentStep.approvers.every(a => a.status === "APPROVED");

    if (allApproved) {
      doc.currentStep += 1;

      if (doc.currentStep >= doc.approvalWorkflow.length) {
        doc.status = "APPROVED";
      }
    }

    await doc.save();
    // 🔍 Audit Log
    await logAudit({
      documentId: doc._id,
      action: action === "APPROVED" ? "APPROVE" : "REJECTED",
      performedBy: approverEmail,
      previousState: doc.toObject(),
      newState: doc.toObject()
    });

    res.status(200).json({ msg: "Action recorded", data: doc });
  } catch (err) {
    res.status(500).json({ msg: "Error approving/rejecting step", error: err.message });
  }
});

/**
 * Get Audit Logs for a Document
 * @route GET /documents/:id/audit
 * @desc Get audit logs for a document
 * @access Public
 * @param {string} id - The ID of the document
 * @returns {Object} Audit logs
 * @throws {Error} If the document is not found
 * @throws {Error} If the audit logs are not found
 */
documentsRouter.get("/:id/audit", async (req, res) => {
  try {
    const logs = await AuditLog.find({
      documentId: req.params.id
    }).sort({ createdAt: 1 });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Error getting audit logs", error: err.message });
  }
});



export default documentsRouter;
