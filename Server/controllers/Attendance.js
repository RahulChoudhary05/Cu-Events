const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

exports.createAttendance = async (req, res) => {
    try {
        const { userId, eventId, isPresent, certificateLink } = req.body;

        if (!userId || !eventId || isPresent === undefined) {
            return res.status(400).json({
                success: false,
                message: 'User ID, Event ID, and attendance status are required',
            });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.accountType !== 'Organizer') {
            return res.status(403).json({
                success: false,
                message: 'Only organizers can create attendance records',
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        const attendanceRecord = await Attendance.create({
            id: userId,
            event: eventId,
            isPresent,
            certificateLink,
        });

        return res.status(201).json({
            success: true,
            message: 'Attendance record created successfully',
            attendance: attendanceRecord,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required',
            });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.accountType !== 'Organizer') {
            return res.status(403).json({
                success: false,
                message: 'Only organizers can view attendance records',
            });
        }

        const attendanceRecords = await Attendance.find({ event: eventId })
            .populate('id', 'name')
            .exec();

        return res.status(200).json({
            success: true,
            data: attendanceRecords,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { attendanceId, isPresent, certificateLink } = req.body;

        if (!attendanceId || isPresent === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Attendance ID and attendance status are required',
            });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.accountType !== 'Organizer') {
            return res.status(403).json({
                success: false,
                message: 'Only organizers can update attendance records',
            });
        }

        const attendanceRecord = await Attendance.findById(attendanceId);
        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }

        attendanceRecord.isPresent = isPresent;
        if (certificateLink) {
            attendanceRecord.certificateLink = certificateLink;
        }
        await attendanceRecord.save();

        return res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully',
            attendance: attendanceRecord,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        if (!attendanceId) {
            return res.status(400).json({
                success: false,
                message: 'Attendance ID is required',
            });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.accountType !== 'Organizer') {
            return res.status(403).json({
                success: false,
                message: 'Only organizers can delete attendance records',
            });
        }

        const deletedRecord = await Attendance.findByIdAndDelete(attendanceId);
        if (!deletedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Attendance record deleted successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};


