import mongoose from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const courseSchema = mongoose.Schema(
  {
    title: reqString,
    description: String,
    category: {
      type: String,
      enum: ["SCIENCE", "PROGRAMMING", "MATH", "ART", "BUSINESS"], 
      required: true,
    },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      required: true,
    },
    publicationStatus: {
      type: String,
      enum: ["PUBLISHED", "DRAFT", "ARCHIVED"],
      default: "DRAFT",
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

courseSchema.pre("save", function (next) {
  this.dateModified = new Date();
  next();
});

const Course = mongoose.model("courses", courseSchema);
export default Course;