const express = require('express');
const router = express.Router();
const {
    generateFixtures,
    getMatches,
    updateScore,
    getUpcomingMatches,
    getMatchHistory,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-fixtures', protect, generateFixtures);
router.get('/upcoming', protect, getUpcomingMatches);
router.get('/history', protect, getMatchHistory);
router.get('/:tournamentId', getMatches);
router.put('/update-score', protect, updateScore);

module.exports = router;
