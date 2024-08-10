const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract jwt token
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("Bearer ", "");

    //if token is not present
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    //varif the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);

      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Somthing went wrong, while verify the token",
    });
  }
};

//isOrganizer middleware
exports.isOrganizer = (req, res, next) => {
  try {
    if (req.user.accountType !== "Organizer") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for Organizer's",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role can't matched",
    });
  }
};

//isUser middleware
exports.isUser = (req, res, next) => {
  try {
    if (req.user.accountType !== "User") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for User's",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role can't matched",
    });
  }
};