const mongoose = require("mongoose")
const Event = require("../models/Events");
const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req, res) => {
    try {
        const { firstName = "", lastName = "", dateOfBirth = "", about = "", contactNumber = "", gender = "", } = req.body
        const id = req.user.id

        // Find the profile by id
        const userDetails = await User.findById(id)
        const profile = await Profile.findById(userDetails.additionalDetails)

        const user = await User.findByIdAndUpdate(id, { firstName, lastName, })

        await user.save()

        // Update the profile fields
        profile.about = about
        profile.contactNumber = contactNumber
        profile.gender = gender

        await profile.save()

        // Find the updated user details
        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec()

        return res.json({
            success: true,
            message: "Profile updated successfully",
            updatedUserDetails,
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id
        const user = await User.findById({ _id: id })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete Assosiated Profile with the User , note we used here "new mongoose.Types.ObjectId()" to convert string into object;
        await Profile.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(user.additionalDetails), })

        // Now Delete User
        await User.findByIdAndDelete({ _id: id })

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    }
    catch (error) {
        res.status(500).json({ success: false, message: "User Cannot be deleted successfully" })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id
        const userDetails = await User.findById(id).populate("additionalDetails").exec()

        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: userDetails,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000)

        const updatedProfile = await User.findByIdAndUpdate({ _id: userId }, { image: image.secure_url }, { new: true })

        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getAttendedEvents = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user details along with attended events
        let userDetails = await User.findById(userId)
            .populate({
                path: 'attendedEvents', // Assuming `attendedEvents` is the field storing event IDs
                populate: {
                    path: 'category', // Populate the event's category
                },
            })
            .exec();

        // Ensure the user exists
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: `User with id ${userId} not found`,
            });
        }

        // Respond with the list of attended events
        return res.status(200).json({
            success: true,
            data: userDetails.attendedEvents,
        });
    } catch (error) {
        console.error('Error fetching attended events:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch attended events. Please try again.',
        });
    }
};

exports.organizerDashboard = async (req, res) => {
    try {
        // Fetch events created by the organizer
        const events = await Event.find({ organizer: req.user.id })
            .select('posterImage name date')
            .exec();

        const eventData = events.map(event => ({
            _id: event._id,
            posterImage: event.posterImage,
            name: event.name,
            date: event.date,
        }));

        res.status(200).json({
            success: true,
            events: eventData,
        });
    } catch (error) {
        console.error('Error fetching organizer dashboard data:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};