require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'TournamentHub API is running...',
        version: '2.0',
        endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET  /api/auth/me',
            'GET  /api/tournaments',
            'POST /api/tournaments/create',
            'GET  /api/tournaments/my-tournaments',
            'GET  /api/tournaments/organizer-tournaments',
            'GET  /api/tournaments/:id',
            'POST /api/tournaments/:id/join',
            'DELETE /api/tournaments/:id',
            'GET  /api/teams/:tournamentId',
            'POST /api/teams/create',
            'GET  /api/matches/upcoming',
            'GET  /api/matches/history',
            'GET  /api/matches/:tournamentId',
            'POST /api/matches/generate-fixtures',
            'PUT  /api/matches/update-score',
            'GET  /api/leaderboard',
            'GET  /api/leaderboard/:tournamentId',
        ]
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`TournamentHub API v2.0 running on port ${PORT}`);
});
