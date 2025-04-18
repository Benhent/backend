import bcryptjs from "bcryptjs";
import crypto from "crypto";

import {User} from "../models/user.model.js";

import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
// import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // Check if all fields are provided
        if (!name || !username || !email || !password) {
            throw new Error("All fields are required");
        }

        // Check if user already exists
        const userAlradyExists = await User.findOne({ email });
        console.log("userAlradyExists: ", userAlradyExists);
        if (userAlradyExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Hash the user's password before saving
        const hashedPassword = await bcryptjs.hash(password, 10);
        // Generate a verification token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
        });

        await user.save();

        // Generate a token and set it as a cookie
        generateTokenAndSetCookies(res, user._id);

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        // Find user with matching verification token
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }
        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("error in verify email: ", error);
        res.status(500).json({success: false, message: "Server error"});
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // If user is a Google user, skip password validation
        if (user.googleId) {
            generateTokenAndSetCookies(res, user._id);

            user.lastLogin = new Date();
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Logged in successfully",
                user: {
                    ...user._doc,
                    password: undefined,
                },
            });
        }

        // Validate password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        generateTokenAndSetCookies(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        console.log("Error in login: ", error);
        res.status(400).json({success: false, message: error.message});    
    }
}

export const logout = async (req, res) => {
    // Clear authentication token
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate password reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();
        // Send password reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        })
    } catch (error) {
        console.log("Error in forgot password: ", error);
        res.status(400).json({success: false, message: error.message});    
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        // Find user by password reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
        // Update user's password
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        // Send password reset success email
        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        })
    } catch (error) {
        console.log("Error in reset password: ", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export const checkAuth = async (req, res) => {
    try {
        // Find user by ID
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log("Error in checkAuth: ", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export const requestAuthorRole = async (req, res) => {
    try {
        const { articles, awards } = req.body;
        const userId = req.user._id;

        // Check for existing pending request
        const existingRequest = await AuthorRequest.findOne({ userId, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending request" });
        }

        // Validate articles
        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({ message: "At least one article is required" });
        }

        // Create new author request
        const authorRequest = new AuthorRequest({
            userId,
            status: 'pending', // Set default status
            articles: articles.map(article => ({
                title: article.title,
                publishDate: article.publishDate,
                category: article.category,
                content: article.content,
                wordFile: article.wordFile
            })),
            awards: awards ? awards.map(award => ({
                name: award.name,
                dateReceived: award.dateReceived,
                proofImage: award.proofImage
            })) : []
        });

        // Save the author request
        await authorRequest.save();

        // Update the user's authorRequest field
        await User.findByIdAndUpdate(userId, {
            $push: { authorRequest: authorRequest._id }
        });

        res.status(201).json({ 
            message: "Author role request submitted successfully",
            authorRequest
        });
    } catch (error) {
        console.error("Error in requestAuthorRole: ", error);
        res.status(500).json({ message: "Error submitting author request" });
    }
};

export const approveAuthorRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user._id;

        // Find author request by ID
        const authorRequest = await AuthorRequest.findById(requestId);
        if (!authorRequest) {
            return res.status(404).json({ success: false, message: "Author request not found" });
        }

        // Check if request is already processed
        if (authorRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "This request has already been processed" });
        }

        // Approve the request
        authorRequest.status = 'approved';
        authorRequest.approvedBy = adminId;
        authorRequest.approvedAt = new Date();
        await authorRequest.save();

        // Update user role to author
        const user = await User.findById(authorRequest.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.role = 'author';
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Author request approved successfully",
            authorRequest
        });
    } catch (error) {
        console.error("Error in approveAuthorRequest: ", error);
        res.status(500).json({ success: false, message: "Error approving author request" });
    }
};

export const rejectAuthorRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user._id;

        // Find author request by ID
        const authorRequest = await AuthorRequest.findById(requestId);
        if (!authorRequest) {
            return res.status(404).json({ success: false, message: "Author request not found" });
        }

        // Check if request is already processed
        if (authorRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: "This request has already been processed" });
        }

        // Find user by ID
        const user = await User.findById(authorRequest.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Reject the request
        authorRequest.status = 'rejected';
        authorRequest.rejectedBy = adminId;
        authorRequest.rejectedAt = new Date();
        authorRequest.rejectionReason = rejectionReason || "No reason provided";
        await authorRequest.save();

        // Optionally, notify the user about the rejection
        // This could be done via email or by updating a notifications field in the User model
        // await sendRejectAuthorRequestEmail(user.email, user.name);

        res.status(200).json({ 
            success: true, 
            message: "Author request rejected successfully",
            authorRequest
        });
    } catch (error) {
        console.error("Error in rejectAuthorRequest: ", error);
        res.status(500).json({ success: false, message: "Error rejecting author request" });
    }
};

export const googleCallback = async (req, res) => {
    try {
        // Generate token and set as cookie
        const token = generateTokenAndSetCookies(res, req.user._id);
        
        // Redirect user to client URL on success
        res.redirect(`${process.env.CLIENT_URL}?auth=success`);
    } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};
