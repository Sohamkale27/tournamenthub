const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Register a new team for a tournament
// @route   POST /api/teams/create  OR  POST /api/teams/add
// @access  Private (Organizer only)
const createTeam = async (req, res) => {
    try {
        const { teamName, players, tournamentId } = req.body;

        if (!teamName || !players || !tournamentId) {
            return res.status(400).json({ message: 'Please provide teamName, players, and tournamentId' });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Only the organizer who created the tournament can add teams
        if (tournament.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized: only the tournament organizer can add teams' });
        }

        // Check if tournament is full
        const currentTeamsCount = await Team.countDocuments({ tournamentId });
        if (currentTeamsCount >= tournament.numberOfTeams) {
            return res.status(400).json({ message: `Tournament is full (${tournament.numberOfTeams} teams max)` });
        }

        // Normalize players: accept array or comma-separated string
        let playersArray = players;
        if (typeof players === 'string') {
            playersArray = players.split(',').map(p => p.trim()).filter(Boolean);
        }

        const team = await Team.create({
            teamName,
            players: playersArray,
            tournamentId,
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all teams for a tournament
// @route   GET /api/teams/:tournamentId
// @access  Public (participants can view teams)
const getTeamsByTournament = async (req, res) => {
    try {
        const teams = await Team.find({ tournamentId: req.params.tournamentId })
            .sort({ createdAt: 1 });
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createTeam,
    getTeamsByTournament,
};
