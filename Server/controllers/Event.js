const Event = require('../models/Event');
const Category = require('../models/Category'); // Ensure correct path to Category model

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
            category: category._id, // Store category reference
            posterImage,
            location,
            photoLink,
            certificationLink,
            attendees,
            topParticipants,
            status,
        });

        return res.status(201).json({ // Use 201 status code for resource creation
            success: true,
            message: 'Event created successfully',
            event: eventDetails,
        });
    } catch (error) {
        console.error('Error creating event:', error.message); // Improved error logging
        return res.status(500).json({
            success: false,
            message: 'Failed to create event. Please try again.',
        });
    }
};
