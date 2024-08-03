const Event = require('../models/Event');
const Category = require('../models/Category'); // Ensure this path is correct

exports.createEvent = async (req, res) => {
    try {
        const { name, description, date, FAQ, categoryId, posterImage, location, photoLink, certificationLink, attendees, topParticipants, status } = req.body;

        // Validate required fields
        if (!name || !description || !date || !categoryId || !posterImage || !location) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, date, categoryId, posterImage, and location are required',
            });
        }

        // Validate category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID',
            });
        }

        // Create the event
        const eventDetails = await Event.create({
            name,
            description,
            date,
            FAQ,
            category: category._id, // Use the category ID
            posterImage,
            location,
            photoLink,
            certificationLink,
            attendees,
            topParticipants,
            status,
        });

        return res.status(200).json({
            success: true,
            message: 'Event created successfully',
            event: eventDetails,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create event. Please try again.',
        });
    }
};