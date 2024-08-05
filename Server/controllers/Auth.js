const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile")
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        // Validate input fields
        if (!firstName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already registered',
            });
        }

        // Find the most recent OTP
        const otpResponse = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (otpResponse.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            });
        }

        // Validate OTP
        if (otp !== otpResponse[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine approval status
        const approved = accountType === 'Organizer' ? false : true;

        // Create profile
        const profileDetails = await Profile.create({
            gender: null,
            about: null,
            contactNumber: contactNumber || null, // Handle contactNumber
        });

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        });

        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User registration failed. Please try again.",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, accountType } = req.body;

        // Validate input fields
        if (!email || !password || !accountType) {
            return res.status(403).json({
                success: false,
                message: 'Please fill in all required fields',
            });
        }

        // Find the user based on account type
        let user;
        if (accountType === 'Organizer') {
            user = await Organizer.findOne({ email }).populate('additionalDetails'); // Ensure Organizer model is defined
        } else if (accountType === 'User') {
            user = await User.findOne({ email }).populate('additionalDetails');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid account type',
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: `${accountType} is not registered. Please sign up first.`,
            });
        }

        // Check if password matches
        if (await bcrypt.compare(password, user.password)) {
            // Generate JWT token
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '20h',
            });

            user.token = token;
            user.password = undefined; 

        
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Cookie expiry
                httpOnly: true, // Prevents client-side JavaScript access
            };

            // Send response with token
            res.cookie('token', token, options).status(200).json({
                success: true,
                message: 'Logged in successfully',
                token,
                user,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
        });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "Already Registered",
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const result = await otp.findOne({ otp: otp });
        console.log("Result is Generate OTP Func");
        console.log("OTP", otp);
        console.log("Result", result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP Body", otpBody);
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const { id } = req.user; // User ID from authenticated request

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        if (newPassword === oldPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password cannot be the same as the old password',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        // Find user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect',
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Password change failed. Please try again.',
        });
    }
};
