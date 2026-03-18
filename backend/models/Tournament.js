const mongoose = require('mongoose');

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
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    matchTime: {
        type: String,
        required: true,
    },
    entryFee: {
        type: Number,
        required: true,
    },
    format: {
        type: String,
        required: true,
    },
    numberOfTeams: {
        type: Number,
        required: true,
    },
    registeredParticipants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxParticipants: {
        type: Number,
        default: 16
    },
    status: {
        type: String,
        default: 'upcoming'
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
