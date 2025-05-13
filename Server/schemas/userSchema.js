import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reqString = {
  type: String,
  required: true,
};

const userSchema = mongoose.Schema({
  username: String,
  password: reqString,
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
  },
  profileImg: String,
  otp: { type: Number },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE",
  },
  role: {
    type: String,
    enum: ["ADMIN", "STUDENT", "TEACHER"],
    default: "ADMIN",
  },
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  this.dateModified = new Date();
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("users", userSchema);

export default User;
