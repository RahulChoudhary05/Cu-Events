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

    const eventDate = new Date(date);
    if (isNaN(eventDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (!status) {
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
      posterImage,
      process.env.FOLDER_NAME
    );
    console.log(poster);

    // Create the event
    const eventDetails = await Event.create({
      name,
      description,
      date: eventDate,
      Organizer: organizerDetails._id,
      category: categoryDetails._id,
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
          event: eventDetails._id,
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

exports.getAllEvents = async (req, res) => {
  try {
    const allEvents = await Event.find(
      { status: "Published" },
      {
        name: true,
        description: true,
        date: true,
        posterImage: true,
        location: true,
        ratingAndReview: true,
        attendance: true,
        topParticipants: true,
      }
    )
      .populate({
        path: 'RatingAndReview',
        select: 'rating review user',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'attendance',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'topParticipants',
        select: 'firstName lastName email'
      })
      .exec();

    return res.status(200).json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    return res.status(500).json({
      success: false,
      message: "Can't fetch event data",
      error: error.message,
    });
  }
};

// Get details of a specific event
exports.getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    const eventDetails = await Event.findById(eventId)
      .populate({
        path: 'RatingAndReview',
        select: 'rating review user',
        populate: {
          path: 'user',
          select: 'firstName lastName email',
        },
      })
      .populate({
        path: 'attendance',
        select: 'firstName lastName email',
      })
      .populate({
        path: 'topParticipants',
        select: 'firstName lastName email',
      })
      .populate({
        path: 'category',
        select: 'name description',
      })
      .exec();

    if (!eventDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find event with id: ${eventId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: eventDetails,
    });
  } catch (error) {
    console.error('Error fetching event details:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event details. Please try again.',
      error: error.message,
    });
  }
};

exports.editevent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const updates = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (req.files && req.files.poster) {
      const posterImage = req.files.poster;
      const poster = await uploadImageToCloudinary(
        posterImage,
        process.env.FOLDER_NAME
      );
      event.posterImage = poster.secure_url;
    }

    // Update the event fields with the provided data
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "Organizer") {
          event[key] = JSON.parse(updates[key]);
        } else {
          event[key] = updates[key];
        }
      }
    }

    await event.save();

    const updateEvent = await Event.findOne({ _id: eventId }).populate({
      path: "Organizer",
      populate: { path: "additionalDetails" },
    }).populate("category")
      .populate("ratingAndReviews")

    res.json({
      success: true,
      message: "Event updated successfully",
      data: updateEvent,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to edit event. Please try again.",
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete event. Please try again.",
    });
  }
}