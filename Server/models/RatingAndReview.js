const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: true,
    },
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon",
        index: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensuring that either hackathon or event is provided
ratingAndReviewSchema.pre("validate", function (next) {
    if (!this.hackathon && !this.event) {
        next(new Error("Either hackathon or event must be provided"));
    } else {
        next();
    }
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
