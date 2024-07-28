const mongoose = require('mongoose');

const hackathonRegistrationSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
    },
    teamMembers: [
        {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false,
            }
        }
    ],
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    projectTitle: {
        type: String,
        required: false,
    },
    projectDescription: {
        type: String,
        required: false,
    },
    submissionLink: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HackathonRegistration', hackathonRegistrationSchema);
