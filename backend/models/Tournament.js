const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    couponCode: {
        type: String,
        required: true,
    },
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sport: {
        type: String,
        required: true,
    },
    location: {
        type: String,
    },
    city: {
        type: String,
    },
    matchTime: {
        type: String,
    },
    entryFee: {
        type: Number,
    },
    format: {
        type: String,
        required: true,
    },
    numberOfTeams: {
        type: Number,
        required: true,
    },
    participants: [participantSchema],
    maxParticipants: {
        type: Number,
        default: 16,
    },
    status: {
        type: String,
        default: 'upcoming',
    },
    startDate: {
        type: Date,
        required: true,
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
