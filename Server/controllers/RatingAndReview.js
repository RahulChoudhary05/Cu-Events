const RatingAndReview = require("../models/RatingAndReview");
const Event = require("../models/Event");
const mongoose = require("mongoose");

const createRating = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { rating, review, eventId } = req.body; 

        const eventDetails = await Event.findOne({
            _id: eventId,
            attendance: { $elemMatch: { $eq: userId } }
        });

        if (!eventDetails) {
            return res.status(404).json({
                success: false,
                message: 'User has not attended the event',
            });
        }

        // Check if the user has already reviewed the event
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            event: eventId
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: 'Event is already reviewed by the user',
            });
        }

        // Create an entry for rating and review in RatingAndReview collection
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            event: eventId,
            user: userId,
        });

        return res.status(200).json({
            success: true,
            message: 'Rating and Review created successfully',
            ratingReview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAverageRating = async (req, res) => {
    try {
        const { eventId } = req.body; 

        const result = await RatingAndReview.aggregate([
            {
                $match: { event: new mongoose.Types.ObjectId(eventId) }
            },
            {
                $group: { _id: null, averageRating: { $avg: "$rating" } }
            }
        ]);

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Average Rating is 0, no ratings given till now',
            averageRating: 0,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: 'desc' })
            .populate({
                path: 'user',
                select: 'firstName lastName email image',
            })
            .populate({
                path: 'event',
                select: 'name date'
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: allReviews,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { createRating, getAverageRating, getAllRating };
