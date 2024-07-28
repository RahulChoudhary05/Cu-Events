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
    time: {
        type: String,
        required: true,
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
    type: {
        type: String,
        enum: ['General', 'Hackathon'],
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
            ref: 'User',
        }
    ],
    topParticipants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Event', eventSchema);
