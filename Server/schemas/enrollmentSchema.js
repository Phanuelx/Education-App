import mongoose from "mongoose";

const enrollmentSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",  // Referring to the courses collection
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",  // referring to the users collection (students)
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,  // default to the current date when the student enrolls
    },
    status: {
      type: String,
      enum: ["ENROLLED", "COMPLETED", "CANCELLED"],
      default: "ENROLLED",  // default status is "ENROLLED"
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    dateModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Pre-save hook to update the `dateModified`
enrollmentSchema.pre("save", function (next) {
  this.dateModified = new Date();
  next();
});

const Enrollment = mongoose.model("enrollments", enrollmentSchema);
export default Enrollment;