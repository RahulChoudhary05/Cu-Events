const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );

        const url = `http://localhost:3000/update-password/${token}`;

        return res.json({
            success: true,
            message:
                "Email send successfully, Please check email and change password",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset the password",
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not matching",
            });
        }

        const userDetails = await User.findOne({ token: token });

        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token Invalid",
            });
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token Expired, Please regenerate your token",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while reset the password",
        });
    }
};
