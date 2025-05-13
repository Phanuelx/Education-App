import express from "express"
import { createClass, deleteClass, getAllClasses, getClassById, updateClass } from "../controllers/classController.js";


const classRouter = express.Router();

classRouter.route("/add").post(createClass);
classRouter.route("/update/:classId").put(updateClass);
classRouter.route("/getAll").get(getAllClasses);
classRouter.route("/getById/:classId").get(getClassById);
classRouter.route("/delete/:classId").delete(deleteClass);
export default classRouter;