const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Register a new team for a tournament
// @route   POST /api/teams/create
// @access  Private
const createTeam = async (req, res) => {
    try {
        const { teamName, players, tournamentId } = req.body;

        if (!teamName || !players || !tournamentId) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Verify tournament exists
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if tournament is full
        const currentTeamsCount = await Team.countDocuments({ tournamentId });
        if (currentTeamsCount >= tournament.numberOfTeams) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        const team = await Team.create({
            teamName,
            players,
            tournamentId,
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all teams for a tournament
// @route   GET /api/teams/:tournamentId
// @access  Public
const getTeamsByTournament = async (req, res) => {
    try {
        const teams = await Team.find({ tournamentId: req.params.tournamentId });
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createTeam,
    getTeamsByTournament,
};
