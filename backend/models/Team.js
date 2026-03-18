const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
    },
    players: [{
        type: String, // Storing player names as strings for simplicity
        required: true,
    }],
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
