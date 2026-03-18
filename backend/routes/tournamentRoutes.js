const express = require('express');
const router = express.Router();
const {
    createTournament,
    getTournaments,
    getTournamentById,
    deleteTournament,
    joinTournament,
    getMyTournaments,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createTournament);
router.get('/my-tournaments', protect, getMyTournaments);
router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.delete('/:id', protect, deleteTournament);
router.post('/:id/join', protect, joinTournament);

module.exports = router;
