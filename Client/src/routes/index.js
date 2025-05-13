// src/routes/index.js
import express from "express";
import userRouter from "./userRoutes.js";
import courseRouter from "./courseRoutes.js";
import classRouter from "./classRoutes.js";
import enrollmentRouter from "./enrollmentRoutes.js";

const router = express.Router();

// Mount all routes
router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/classes", classRouter);
router.use("/enrollments", enrollmentRouter);

export default router;