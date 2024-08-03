const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    FAQ: [
        {
            question: {
                type: String,
                required: true,
            },
            answer: {
                type: String,
                required: true,
            }
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    ratingAndReview: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RatingAndReview',
        }
    ],
    posterImage: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    photoLink: {
        type: String,
        required: false,
    },
    certificationLink: {
        type: String,
        required: false,
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        }
    ],
    topParticipants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
