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
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        index: true,
    }
});

// Ensuring that either hackathon or event is provided
ratingAndReviewSchema.pre("validate", function (next) {
    if (!this.event) {
        next(new Error("Event must be provided"));
    } else {
        next();
    }
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
