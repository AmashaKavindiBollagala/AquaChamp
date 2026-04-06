import User from "../models/dushani-User.js";

import { v4 as uuidv4 } from "uuid";

import SecurityEmailVerification from "../models/securityEmailVerification.js";

import { securitySendEmail } from "../utils/securitySendEmail.js";

import { isValidEmail } from "../utils/kaveesha-emailCheck.js";

// Check if username is available
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters",
      });
    }
    
    const existingUser = await User.findOne({ username });
    
    res.status(200).json({
      success: true,
      available: !existingUser,
    });
  } catch (error) {
    console.error("Check username error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if email is available
export const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    res.status(200).json({
      success: true,
      available: !existingUser,
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    console.log(`\n🚀 Registration attempt received`);
    const { firstName, lastName, age, username, password } = req.body;
    const email = req.body.email.toLowerCase();

    // ✅ Validate email format + MX
    console.log(`📧 Validating email: ${email}`);
    const validEmail = await isValidEmail(email);
    console.log(`📧 Email validation result: ${validEmail ? 'VALID' : 'INVALID'}`);

    if (!validEmail) {
      console.log(`🚫 Registration blocked - Invalid email: ${email}\n`);
      return res.status(400).json({
        success: false,
        message: "Invalid email domain. Please use a valid email address (e.g., gmail.com, yahoo.com, outlook.com)",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      age: parseInt(age),
      email,
      username,
      password,
    });

    console.log(`💾 Saving user to database...`);
    await user.save();
    console.log(`✅ User saved successfully with ID: ${user._id}`);

    // 🔐 create verification token
    const token = uuidv4();

    // save token
    await SecurityEmailVerification.create({
      userId: user._id,
      token,
    });

    // create verification link
    const verificationLink = `http://localhost:4000/api/security/verify-email/${token}`;

    // send email
    const html = `
<div style="font-family: Arial, sans-serif; background:#EAF5FF; padding:40px 0;">
  <div style="max-width:500px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg,#042C53,#185FA5,#1D9E75); padding:25px; text-align:center; color:white;">
      
      <img src="http://localhost:4000/uploads/images/AquaChampLogo.png" alt="AquaChamp Logo" style="width:60px;height:60px;border-radius:12px;margin-bottom:10px;" />
      
      <h1 style="margin:0;font-size:24px;">💧 AquaChamp</h1>
      <p style="margin:5px 0 0;font-size:12px;">Clean Water · Safe Futures</p>
    </div>

    <!-- Body -->
    <div style="padding:30px; text-align:center;">
      <h2 style="color:#0f172a;">👋 Welcome, Hero!</h2>

      <p style="color:#475569; font-size:14px; line-height:1.6;">
        You're one step away from starting your hygiene adventure 🎮✨
      </p>

      <p style="color:#475569; font-size:14px;">
        Click below to verify your email:
      </p>

      <!-- Button -->
      <a href="${verificationLink}" 
         style="display:inline-block;margin-top:20px;padding:14px 28px;
         background:linear-gradient(135deg,#0284c7,#10b981);
         color:white;text-decoration:none;border-radius:10px;
         font-weight:bold;font-size:15px;">
         🚀 Verify My Account
      </a>

      <p style="margin-top:20px;font-size:12px;color:#94a3b8;">
        ⏳ This link expires in 1 hour
      </p>

      <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;padding:15px;text-align:center;font-size:11px;color:#64748b;">
      © 2026 AquaChamp 🌊 | Stay Clean, Stay Healthy 💙
    </div>

  </div>
</div>
`;

    await securitySendEmail(
      user.email,
      "Verify Your Email",
      html
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get current user profile (from JWT token)
export const getCurrentUserProfile = async (req, res) => {
  try {
    console.log("\n🔐 Getting current user profile");
    console.log("   req.user:", req.user);
    
    // req.user is set by verifyJWT middleware - it's the username
    const username = req.user;
    
    if (!username) {
      console.log("❌ No username in request");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    console.log(`🔍 Finding user by username: ${username}`);
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`✅ User found: ${user.email}`);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get current user profile error:", error);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Remove password from update data if present
    delete updateData.password;
    delete updateData.confirmPassword;

    // Check if email or username already exists for another user
    if (updateData.email) {
      const existingEmail = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (updateData.username) {
      const existingUsername = await User.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
    }

    // Update age to number if provided
    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        username: user.username,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete user account
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all users (for admin purposes)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
