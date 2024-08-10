const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event',
    },
    isPresent: {
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

module.exports = mongoose.model('Attendance', attendanceSchema);
