const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
    },
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: false, // Could be null if waiting for winner of previous match
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: false,
    },
    scoreA: {
        type: Number,
        default: 0,
    },
    scoreB: {
        type: Number,
        default: 0,
    },
    scoreSummary: {
        type: String,
        required: false, // Used for strings like "150/4", "21-18, 19-21"
    },
    matchDate: {
        type: Date,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'finished'],
        default: 'upcoming',
    },
    // Used primarily for knockout tree positioning
    round: {
        type: Number,
        required: false,
    },
    matchNumber: {
        type: Number,
        required: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
