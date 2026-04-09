const express = require('express');
const router = express.Router();
const {
    createTeam,
    getTeamsByTournament,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// Both /create and /add point to the same controller (organizer only)
router.post('/create', protect, createTeam);
router.post('/add', protect, createTeam);         // alias for /create
router.get('/:tournamentId', getTeamsByTournament);

module.exports = router;
