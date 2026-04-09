const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['organizer', 'participant'],
        default: 'participant',
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    sportsStats: {
        cricket: {
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 }
        },
        football: {
            goals: { type: Number, default: 0 }
        },
        badminton: {
            wins: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
