import asyncHandler from "express-async-handler";
import Course from "../schemas/courseSchema.js";

export const createCourse = asyncHandler(async (req, res) => {
    try {
      const { title, description, category, level, publicationStatus } = req.body;
  
      const newCourse = await Course.create({
        title,
        description,
        category,
        level,
        publicationStatus,
      });
  
      return res.status(201).json({
        success: true,
        msg: "Course created successfully",
        course: newCourse,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      return res.status(500).json({
        success: false,
        msg: "Server Error",
        error: error.message,
      });
    }
  });
  
  // Get course by ID
  export const getCourseById = asyncHandler(async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({
          success: false,
          msg: `Course not found with ID: ${courseId}`,
        });
      }
  
      return res.status(200).json({ success: true, course });
    } catch (error) {
      console.error("Error fetching course:", error);
      return res.status(500).json({
        success: false,
        msg: "Server Error",
        error: error.message,
      });
    }
  });
  
  // Get all courses (with optional pagination)
  export const getAllCourses = asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
  
      const totalCourses = await Course.countDocuments();
      const totalPages = Math.ceil(totalCourses / pageSize);
  
      const courses = await Course.find()
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ dateCreated: -1 });
  
      return res.status(200).json({
        success: true,
        courses,
        pagination: {
          page,
          pageSize,
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error getting all courses:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Update a course
  export const updateCourse = asyncHandler(async (req, res) => {
    try {
      const { courseId, title, description, category, level, publicationStatus } =
        req.body;
  
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({
          success: false,
          msg: `Course not found with ID: ${courseId}`,
        });
      }
  
      await Course.findByIdAndUpdate(
        courseId,
        { title, description, category, level, publicationStatus },
        { new: true }
      );
  
      const updatedCourse = await Course.findById(courseId);
  
      return res.status(200).json({
        success: true,
        msg: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error) {
      console.error("Error updating course:", error);
      return res.status(500).json({
        success: false,
        msg: "Cannot update course",
        error: error.message,
      });
    }
  });
  
  // Delete a course
  export const deleteCourse = asyncHandler(async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const deleted = await Course.findByIdAndDelete(courseId);
  
      if (!deleted) {
        return res.status(404).json({
          success: false,
          msg: `Course not found with ID: ${courseId}`,
        });
      }
  
      return res.status(200).json({
        success: true,
        msg: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });