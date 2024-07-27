const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
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
        enum: ['student', 'admin'],
        default: 'student',
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('User', userSchema);