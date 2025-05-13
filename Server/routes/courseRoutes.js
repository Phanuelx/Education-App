import express from "express"
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../controllers/courseController.js";


const courseRouter = express.Router();

courseRouter.route("/add").post(createCourse);
courseRouter.route("/getById/:courseId").get(getCourseById);
courseRouter.route("/getAll").get(getAllCourses);
courseRouter.route("/update").put(updateCourse);
courseRouter.route("/delete/:courseId").delete(deleteCourse);


export default courseRouter;