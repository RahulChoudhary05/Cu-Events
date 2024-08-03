const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: ['General', 'Hackathon'], // Ensure this matches your event types
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
