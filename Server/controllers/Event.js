const Event = require("../models/Events");
const Category = require("../models/Category");
const User = require("../models/User");

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;

    let { name, description, date, categoryId, location, status } = req.body;

    const posterImage = req.files.poster;

    if (
      !name ||
      !description ||
      !date ||
      !categoryId ||
      !posterImage ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, date, categoryId, posterImage, and location are required",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    const organizerDetails = await User.findById(userId);
    if (!organizerDetails || organizerDetails.accountType !== "Organizer") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create events",
      });
    }

    const categoryDetails = await Category.findById(categoryId);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID",
      });
    }

    const poster = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log(poster);

    // Create the event
    const eventDetails = await Event.create({
      name,
      description,
      date,
      Organizer: organizerDetails._id,
      category: categoryDetails._id,
      posterImage,
      location,
      posterImage: poster.secure_url,
      status: status,
    });

    await User.findByIdAndUpdate(
      {
        _id: organizerDetails._id,
      },
      {
        $push: {
          events: eventDetails._id,
        },
      },
      { new: true }
    );

    await Category.findByIdAndUpdate(
      { _id: categoryId },
      {
        $push: {
          course: eventDetails._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Event created successfully",
      event: eventDetails,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create event. Please try again.",
    });
  }
};