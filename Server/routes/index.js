import expressRouter from "express";
import userRouter from "./userRoutes.js";
import courseRouter from "./courseRoutes.js";
import classRouter from "./classRoutes.js";
import enrollmentRouter from "./enrollmentRoutes.js";


const router = expressRouter();

router.use("/user", userRouter);
router.use("/course", courseRouter);
router.use("/class", classRouter);
router.use("/enrollment", enrollmentRouter);


export default router;
