const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: false,
        trim: true,
    },
    id: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    outlook: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ['Organizer', 'User'],
        default: 'user',
        required: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    attendedEvents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
        }
    ],
    token: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    image: {
        type: String,
        required: true,
    },

},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);