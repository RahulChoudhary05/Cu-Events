// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
        ,
    },
    type: {
        type: String,
        enum: ['general', 'hackathon'],
        required: true,
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    topParticipants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }] // For hackathon winners
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Event', eventSchema);
