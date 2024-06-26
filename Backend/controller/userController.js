import User from "../models/userModel.js";
import KycVerification from "../models/kycModel.js";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "../utils/sendMail.js";
import asyncHandler from "../middleware/asyncHandler.js";

// OTP verification
const sendOtpMail = asyncHandler(async (req, res) => {
  const {  email } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
    
      email,
      otp,
      otpExpires,
      isVerified: false
    });

    await sendVerificationEmail(email, otp);
    await user.save();

    res.status(200).json({ message: "OTP sent successfully", userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// Signup
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.name = name;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    user.password = password;

    await user.save();

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// Create a new KYC verification document
const submitKycVerification = async (req, res) => {
    try {
      // Extract data from request body
      const { contact, dob, email, idProofType } = req.body;
      const idProofImage = req.file.path;
  
      
      const kycVerification = new KycVerification({
        contact,
        dob,
        email,
        idProofType,
        idProofImage,
       
      });
  
      // Save the KYC verification document to the database
      const savedKycVerification = await kycVerification.save();
  
      // Respond with success message and saved KYC verification data
      res.status(201).json(savedKycVerification);
    } catch (error) {
      // If an error occurs, respond with error status and message
      res.status(500).json({ message: "KYC verification submission failed", error: error.message });
    }
  };


// @route   POST/ api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  });

export { registerUser, sendOtpMail, authUser , logoutUser, submitKycVerification};
