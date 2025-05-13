import asyncHandler from "express-async-handler";
import Class from "../schemas/classSchema.js";

export const createClass = asyncHandler(async (req, res) => {
  try {
    const {
      course,
      user,
      title,
      description,
      scheduledDateTime,
      duration,
      status,
    } = req.body;

    // Create a new class
    const newClass = new Class({
      course,
      user,
      title,
      description,
      scheduledDateTime,
      duration,
      status,
    });

    // Save the class to the database
    await newClass.save();

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const updateClass = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, scheduledDateTime, duration, status } =
      req.body;

    // Find the class by ID
    const classDoc = await Class.findById(classId);

    if (!classDoc) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Class not found with ID: ${classId}`,
        });
    }

    // Update the class
    classDoc.title = title || classDoc.title;
    classDoc.description = description || classDoc.description;
    classDoc.scheduledDateTime =
      scheduledDateTime || classDoc.scheduledDateTime;
    classDoc.duration = duration || classDoc.duration;
    classDoc.status = status || classDoc.status;

    await classDoc.save();

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: classDoc,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const getAllClasses = asyncHandler(async (req, res) => {
  try {
    const classes = await Class.find().populate("course user");

    return res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const getClassById = asyncHandler(async (req, res) => {
  try {
    const classId = req.params.classId;

    const classDoc = await Class.findById(classId).populate("course user");

    if (!classDoc) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Class not found with ID: ${classId}`,
        });
    }

    return res.status(200).json({
      success: true,
      class: classDoc,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export const deleteClass = asyncHandler(async (req, res) => {
  try {
    const classId = req.params.classId;

    // Find and delete the class
    const classDoc = await Class.findByIdAndDelete(classId);

    if (!classDoc) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Class not found with ID: ${classId}`,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});
