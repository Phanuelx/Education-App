import express from "express";
import {
  createEnrollment,
  deleteEnrollment,
  getEnrollmentsByCourse,
  getEnrollmentsByStudent,
  updateEnrollmentStatus,
} from "../controllers/enrollmentController.js";

const enrollmentRouter = express.Router();

enrollmentRouter.route("/create").post(createEnrollment);

enrollmentRouter.route("/getByStudent/:userId").get(getEnrollmentsByStudent);

enrollmentRouter.route("/getByCourse/:courseId").get(getEnrollmentsByCourse);

enrollmentRouter.route("/update").put(updateEnrollmentStatus);

enrollmentRouter.route("/delete/:enrollmentId").delete(deleteEnrollment);

export default enrollmentRouter;
