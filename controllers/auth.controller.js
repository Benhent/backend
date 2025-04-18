import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import cloudinary from "../service/cloudinary.config.js";
import { 
  sendVerificationEmail, 
  sendPasswordResetRequestEmail, 
  sendPasswordResetSuccessEmail 
} from "../mail/mail.js";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password, link = "", national = "", avatarUrl = "" } = req.body;

    // Input validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, username, email, and password are required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? "Email already in use" 
          : "Username already taken"
      });
    }

    // Hash the password with a strong salt factor
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      link,
      national,
      avatarUrl,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Generate token and set cookie
    generateTokenAndSetCookies(res, user._id);

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    // Return user data (excluding password)
    res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required"
      });
    }

    // Find user with matching verification token that hasn't expired
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code"
      });
    }

    // Mark user as verified and clear verification fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification"
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with new verification token
    user.verificationToken = verificationCode;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully"
    });
  } catch (error) {
    console.error("Error in resendVerification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification email"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        isVerified: false
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate token and set cookie
    generateTokenAndSetCookies(res, user._id);
        
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Return user data (excluding password)
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a password reset link"
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before storing it (for security)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiration in user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // Send password reset email
    await sendPasswordResetRequestEmail(user.email, resetURL);

    res.status(200).json({
      success: true,
      message: "If your email is registered, you will receive a password reset link"
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing password reset request"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Hash the token from params to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Send password reset success email
    await sendPasswordResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resetting password"
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking authentication"
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if new password meets requirements
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long"
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, link, national } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken"
        });
      }
    }

    // Handle avatar update if file was uploaded
    if (req.file) {
      // Xóa avatar cũ trên Cloudinary nếu có và không phải avatar mặc định
      if (user.avatarUrl && user.avatarUrl.includes('cloudinary.com')) {
        try {
          // Trích xuất public_id từ URL (lưu ý cách này có thể cần điều chỉnh tùy vào URL format)
          const urlParts = user.avatarUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `avatars/${publicIdWithExtension.split('.')[0]}`; 
          
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Tiếp tục xử lý dù có lỗi khi xóa ảnh cũ
        }
      }
      
      // Cập nhật URL avatar mới
      user.avatarUrl = req.file.path; // @fluidjs/multer-cloudinary lưu URL trong req.file.path
    }

    // Update user fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (link) user.link = link;
    if (national) user.national = national;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        link: user.link,
        national: user.national,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
};