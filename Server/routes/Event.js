const express = require("express")
const router = express.Router()

const {
    createEvent,
    getAllEvents,
    getEventDetails,
    editevent,
    getFullEventDetails,
    getOrganizerEvent,
    deleteEvent
} = require("../controllers/Event")

const {
    createCategory,
} = require("../controllers/Category");

const {
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controllers/RatingAndReview");

const {
    auth,
    isOrganizer,
    isUser,
} = require("../middlewares/auth");



router.post("/createEvent", auth, isOrganizer, createEvent)
router.post("/getAllEvents", auth, isOrganizer, getAllEvents)
router.post("/editevent", auth, isOrganizer, editevent)
router.post("/getOrganizerEvent", auth, isOrganizer, getOrganizerEvent)
router.post("/deleteEvent", auth, isOrganizer, deleteEvent)
router.post("/getFullEventDetails", auth, getFullEventDetails)
router.post("/getEventDetails", getEventDetails)

router.post("/createCategory", auth, isUser, createCategory);

router.post("/createRating", auth, isUser, createRating);
router.post("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);



module.exports = router