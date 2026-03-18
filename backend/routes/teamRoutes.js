const express = require('express');
const router = express.Router();
const {
    createTeam,
    getTeamsByTournament,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createTeam);
router.get('/:tournamentId', getTeamsByTournament);

module.exports = router;
