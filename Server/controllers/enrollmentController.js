import asyncHandler from "express-async-handler";
import Enrollment from "../schemas/enrollmentSchema.js";
import Course from "../schemas/courseSchema.js";
import User from "../schemas/userSchema.js";


// Create a new enrollment
export const createEnrollment = asyncHandler(async (req, res) => {
  try {
    const { course, user } = req.body;

    // Validate presence
    if (!course || !user) {
      return res.status(400).json({
        success: false,
        message: "Both course and user are required.",
      });
    }

    // Check if course and user exist
    const courseExists = await Course.findById(course);
    const userExists = await User.findById(user);

    if (!courseExists || !userExists) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found.",
      });
    }

    // Create the enrollment
    const newEnrollment = new Enrollment({
      course,
      user,
    });

    // Save the enrollment
    await newEnrollment.save();

    return res.status(201).json({
      success: true,
      message: "Enrollment created successfully.",
      enrollment: newEnrollment,
    });

  } catch (error) {
    console.error("Error creating enrollment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});
  
  
// Get all enrollments for a student
export const getEnrollmentsByStudent = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({ user: userId }).populate("course");

    if (!enrollments.length) {
      return res.status(404).json({
        success: false,
        message: "No enrollments found for this student",
      });
    }

    return res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Get all students enrolled in a course
export const getEnrollmentsByCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ course: courseId }).populate("user");

    if (!enrollments.length) {
      return res.status(404).json({
        success: false,
        message: "No students enrolled in this course",
      });
    }

    return res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Update the enrollment status
export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  try {
    const { enrollmentId, status } = req.body;

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status },
      { new: true }
    );

    if (!updatedEnrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment status updated successfully",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Delete an enrollment
export const deleteEnrollment = asyncHandler(async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!deletedEnrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});