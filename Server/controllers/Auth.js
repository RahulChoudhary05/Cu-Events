const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile")
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

exports.signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp, id } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !accountType || !id) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) { // Validate password match
            return res.status(400).json({
                success: false,
                message: 'Password and ConfirmPassword value does not match, please try again',
            });
        }

        const existingUser = await User.findOne({ email }); // Check if user already exists
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1); // Find most recent OTP
        if (response.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            });
        } else if (otp !== response[0].otp) { // Validate OTP
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        // Create profile details entry
        const profileDetails = await Profile.create({
            gender: null,
            about: null,
            contactNumber: null,
        });

        // Common user object
        const userObject = {
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        };

        if (accountType === 'Organizer') { // Additional fields for organizer
            if (!staffId) {
                return res.status(403).json({
                    success: false,
                    message: "Staff ID is required for organizer",
                });
            }
            userObject.staffId = staffId;
            userObject.approved = false;
        }

        // Create user in DB
        const user = await User.create(userObject);

        return res.status(200).json({
            success: true,
            user,
            message: `${accountType} is registered successfully`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `${accountType} cannot be registered. Please try again`,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, accountType } = req.body; // get data from req body

        if (!email || !password || !accountType) { // validate that all required fields are filled
            return res.status(403).json({
                success: false,
                message: 'Please Fill up All the Required Fields',
            });
        }

        let user;
        if (accountType === 'organizer') {
            user = await Organizer.findOne({ email }).populate("additionalDetails"); // check if organizer exists
        } else {
            user = await User.findOne({ email }).populate("additionalDetails"); // check if user exists
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: `${userType} is not registered, please signup first`,
            });
        }

        if (await bcrypt.compare(password, user.password)) { // generate JWT after password matching
            const payload = { // generate payload
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { // generate token
                expiresIn: "20h", // set expiry time
            });

            user.token = token;
            user.password = undefined;

            const options = { // create cookie and send response
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure, please try again',
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
      const userDetails = await User.findById(req.user.id);
  
      const { oldPassword, newPassword, conformPassword } = req.body;
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );
      if (oldPassword || newPassword) {
        return res.status(400).json({
          success: false,
          message: "New Password cannot be same as Old Password",
        });
      }
  
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Password incorrect",
        });
      }
  
      if (newPassword || conformPassword) {
        return res.status(400).json({
          uccess: false,
          message: "New Password and conform Password doesn't match",
        });
      }
  
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const updateUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      );
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
