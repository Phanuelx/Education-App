import asyncHandler from "express-async-handler";
import User from "../schemas/userSchema.js";
import { sendEmail } from "../utils/emailSender.js";

export const addUser = asyncHandler(async (req, res) => {
    const { username, password, email, phone, role, profileImg, status } = req.body;
  
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }],
    });
  
    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: "User already exists with this email or phone",
      });
    }
  
    const user = await User.create({
      username,
      password,
      email,
      phone,
      role: role || "STUDENT", 
      profileImg,
      status,
    });
  
    return res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  });

  export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "username";
    const sortOrder = req.query.sortOrder || "asc";
  
    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
    const totalDocuments = await User.countDocuments();
    const totalPages = Math.ceil(totalDocuments / pageSize);
    const skip = (page - 1) * pageSize;
  
    const users = await User.find().sort(sort).skip(skip).limit(pageSize);
  
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  });
  
  export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      msg: `User not found with ID: ${userId}`,
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
    const { userId, username, phone, email, profileImg, status, role } = req.body;
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `User not found with ID: ${userId}`,
      });
    }
  
    await User.findByIdAndUpdate(userId, {
      username,
      phone,
      email,
      profileImg,
      status,
      role,
      dateModified: new Date(),
    });
  
    const updatedUser = await User.findById(userId);
  
    return res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser,
    });
  });

  export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    const user = await User.findByIdAndDelete(userId);
  
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `User not found with ID: ${userId}`,
      });
    }
  
    return res.status(200).json({
      success: true,
      msg: "User deleted successfully",
    });
  });

  export const login = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const userDoc = await User.findOne({ email });
  
      if (!userDoc) {
        return res.status(401).json({
          success: false,
          msg: `User does not exist with the email ${email}`,
        });
      }
  
      const isMatch = await userDoc.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, msg: "Invalid password" });
      }
  
      if (userDoc.status !== "ACTIVE") {
        return res
          .status(400)
          .json({ success: false, msg: "User is not active" });
      }
  
      return res
        .status(200)
        .json({ userDoc, success: true, msg: "Logged in successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message, success: false });
    }
  });
  
  function generateSecureNumericOTP(length) {
    length = 4;
  
    const digits = "0123456789";
    const digitsLength = digits.length;
  
    const array = new Uint32Array(length);
  
    crypto.getRandomValues(array);
  
    const otp = Array.from(array, (value) => digits[value % digitsLength]).join(
      ""
    );
    if (otp.length === length) {
      return otp;
    }
    return generateSecureNumericOTP(length);
  }
  
  export const triggerEmailOtp = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      let userDoc = await User.findOne({ email: email });
      if (!userDoc) {
        return res.status(404).json({
          success: false,
          msg: "User not found for the provided Email Id.",
        });
      }
      const otp = generateSecureNumericOTP(4);
      userDoc.otp = otp;
      await userDoc.save();
      await sendEmail(
        email,
        "Password Reset",
        `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>OTP Verification</title>
          </head>
          <body>
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 10px;
                font-family: Arial, sans-serif;
                color: #333;
              "
            >
              <div
                style="
                  text-align: center;
                  padding: 20px;
                  background-color: #5356fb;
                  border-radius: 10px 10px 0 0;
                "
              >
                <h1 style="color: white; margin: 0">OTP Verification</h1>
              </div>
              <div
                style="
                  padding: 20px;
                  background: rgba(255, 255, 255, 0.6);
                  backdrop-filter: blur(5px);
                  border-radius: 0 0 10px 10px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                "
              >
                <p style="margin: 0 0 15px">Dear User,</p>
                <p style="margin: 0 0 15px">
                  Your One-Time Password (OTP) for verification is:
                </p>
    
                <div
                  style="
                    margin: 20px 0;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px;
                    background: linear-gradient(90deg, #5356fb, #f539f8);
                    color: white;
                  "
                >
                  ${otp}
                </div>
    
                <p style="margin: 0 0 15px">
                  Please enter this code on the verification screen to proceed.
                </p>
                <p style="margin: 0 0 15px">
                  If you did not request this, please ignore this email.
                </p>
              </div>
              <div
                style="
                  text-align: center;
                  margin-top: 10px;
                  padding: 15px;
                  background-color: #f0f0f0;
                  border-radius: 10px;
                "
              >
                <p style="margin: 0">Thank you for using our service!</p>
                <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
                  &copy; 2025
                  <a style="text-decoration: none" href="https://demo.sbpl-tc.com/"
                    >South Bharath Premier League</a
                  >
                  powered by
                  <a
                    style="text-decoration: none"
                    href="https://www.orbittechnologys.com/"
                    >Orbit Technologys</a
                  >
                  . All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
    `
      );
  
      return res.status(200).json({
        success: true,
        userDoc,
        msg: "OTP Sent Successfully",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  });
  
  export const verifyEmailOtp = asyncHandler(async (req, res) => {
    try {
      const { otp, userId } = req.body;
      const userDoc = await User.findOne({
        _id: userId,
      });
  
      if (!userDoc) {
        console.log("Invalid user id or OTP has expired: " + userId);
        return res.status(400).json({
          success: false,
          msg: "Invalid user id or OTP has expired",
        });
      }
  
      if (otp != userDoc.otp) {
        console.log("Invalid OTP: " + otp);
        return res.status(400).json({
          success: false,
          msg: "Invalid OTP: " + otp,
        });
      }
  
      return res.status(200).json({
        success: true,
        userDoc,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error,
      });
    }
  });
  
  export const resetPassword = asyncHandler(async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
  
      // const salt = await bcrypt.genSalt(10)
      // user.password = await bcrypt.hash(newPassword, salt)
      user.password = newPassword;
      await user.save();
  
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error,
      });
    }
  });
  