const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/User");
const eventRoutes = require("./routes/Event");
const contactRoutes = require("./routes/Contact");
const profileRoutes = require("./routes/Profile");

const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");

dotenv.config();
const PORT = process.env.PORT || 4000;

// Database connection
database.connect();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Cloudinary connection
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/contact", contactRoutes);

// Default route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running....",
    });
});

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
});