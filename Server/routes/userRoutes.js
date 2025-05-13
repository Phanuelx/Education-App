import express from "express"
import { addUser, deleteUser, getAllUsers, getUserById, login, resetPassword, triggerEmailOtp, updateUser, verifyEmailOtp } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.route("/add").post(addUser);
userRouter.route("/getAll").get(getAllUsers);
userRouter.route("/getUserbyId/:userId").get(getUserById);
userRouter.route("/update").put(updateUser);
userRouter.route("/delete/:userId").delete(deleteUser);
userRouter.route("/login").post(login);
userRouter.route("/triggerOTP").post(triggerEmailOtp);
userRouter.route("/verifyEmailOtp").post(verifyEmailOtp);
userRouter.route("/resetPassword").post(resetPassword);



export default userRouter;