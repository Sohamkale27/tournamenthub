const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
    },
    tokenCode: {
        type: String,
        required: true,
        unique: true,
    },
    sport: {
        type: String,
        required: true,
    },
    venue: {
        type: String,
        required: true,
    },
    matchTime: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
