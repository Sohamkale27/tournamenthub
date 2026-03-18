const express = require('express');
const router = express.Router();
const { getLeaderboard, getGlobalLeaderboard } = require('../controllers/leaderboardController');

router.get('/', getGlobalLeaderboard);
router.get('/:tournamentId', getLeaderboard);

module.exports = router;
