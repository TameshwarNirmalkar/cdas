import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["APPROVER", "USER"],
    default: "USER"
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  // 1. Check if password was actually changed
  if (!this.isModified("password")) return;

  // 2. Hash the password
  // Mongoose waits for this await to finish automatically
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
