const mongoose = require('mongoose');

const generalEventRegistrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    attendance: {
        type: Boolean,
        default: false,
    },
    certificateLink: {
        type: String,
        required: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('General', generalEventRegistrationSchema);
