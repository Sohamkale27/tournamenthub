const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// Helper to shuffle array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// @desc    Generate fixtures for a tournament
// @route   POST /api/matches/generate-fixtures
// @access  Private
const generateFixtures = async (req, res) => {
    try {
        const { tournamentId } = req.body;

        // Validate tournament
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Ensure user is the organizer
        if (tournament.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Determine if matches already exist
        const existingMatches = await Match.countDocuments({ tournamentId });
        if (existingMatches > 0) {
            return res.status(400).json({ message: 'Fixtures already generated for this tournament' });
        }

        const teams = await Team.find({ tournamentId });

        if (teams.length < 2) {
            return res.status(400).json({ message: 'Not enough teams to generate fixtures' });
        }

        let matches = [];

        if (tournament.format === 'knockout') {
            // Basic knockout generation for Round 1
            let shuffledTeams = shuffleArray([...teams]);
            let matchNumber = 1;

            // Pairs
            for (let i = 0; i < shuffledTeams.length; i += 2) {
                if (i + 1 < shuffledTeams.length) {
                    matches.push({
                        tournamentId,
                        teamA: shuffledTeams[i]._id,
                        teamB: shuffledTeams[i + 1]._id,
                        round: 1,
                        matchNumber: matchNumber++,
                    });
                }
            }

            // Ignore byes for now or handle them simply by not pairing the last team
        } else if (tournament.format === 'round_robin') {
            // Standard Round Robin Algorithm
            let teamsList = [...teams];
            if (teamsList.length % 2 !== 0) {
                teamsList.push(null); // Dummy team for Bye
            }

            const numRounds = teamsList.length - 1;
            const halfSize = teamsList.length / 2;
            let matchNumber = 1;

            for (let round = 0; round < numRounds; round++) {
                for (let i = 0; i < halfSize; i++) {
                    const teamA = teamsList[i];
                    const teamB = teamsList[teamsList.length - 1 - i];

                    if (teamA !== null && teamB !== null) {
                        matches.push({
                            tournamentId,
                            teamA: teamA._id,
                            teamB: teamB._id,
                            round: round + 1,
                            matchNumber: matchNumber++,
                        });
                    }
                }
                // Rotate array except first item
                teamsList.splice(1, 0, teamsList.pop());
            }
        }

        // Save all matches
        const createdMatches = await Match.insertMany(matches);
        res.status(201).json({ message: 'Fixtures generated successfully', count: createdMatches.length });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all matches for a tournament
// @route   GET /api/matches/:tournamentId
// @access  Public
const getMatches = async (req, res) => {
    try {
        const matches = await Match.find({ tournamentId: req.params.tournamentId })
            .populate('teamA', 'teamName')
            .populate('teamB', 'teamName')
            .sort({ round: 1, matchNumber: 1 });

        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get upcoming matches for logged in user
// @route   GET /api/matches/upcoming
// @access  Private
const getUpcomingMatches = async (req, res) => {
    try {
        if (!req.user || !req.user.name) {
            return res.status(200).json([]);
        }

        const teams = await Team.find({ players: req.user.name });
        if (!teams || teams.length === 0) {
            return res.status(200).json([]);
        }

        const teamIds = teams.map(t => t._id);

        const matches = await Match.find({
            $or: [{ teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }],
            status: { $in: ['upcoming', 'live'] }
        })
            .populate('teamA', 'teamName')
            .populate('teamB', 'teamName')
            .populate('tournamentId', 'name sport location')
            .sort({ matchDate: 1 });

        return res.status(200).json(matches || []);
    } catch (error) {
        console.error("Error in getUpcomingMatches:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get match history for logged in user
// @route   GET /api/matches/history
// @access  Private
const getMatchHistory = async (req, res) => {
    try {
        if (!req.user || !req.user.name) {
            return res.status(200).json([]);
        }

        const teams = await Team.find({ players: req.user.name });
        if (!teams || teams.length === 0) {
            return res.status(200).json([]);
        }

        const teamIds = teams.map(t => t._id);

        const matches = await Match.find({
            $or: [{ teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }],
            status: 'finished'
        })
            .populate('teamA', 'teamName')
            .populate('teamB', 'teamName')
            .populate('tournamentId', 'name sport')
            .sort({ updatedAt: -1 });

        return res.status(200).json(matches || []);
    } catch (error) {
        console.error("Error in getMatchHistory:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update match score
// @route   PUT /api/matches/update-score
// @access  Private
const updateScore = async (req, res) => {
    try {
        const { matchId, scoreA, scoreB, status } = req.body;

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const tournament = await Tournament.findById(match.tournamentId);

        // Authorization check
        if (tournament.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update scores' });
        }

        match.scoreA = scoreA !== undefined ? scoreA : match.scoreA;
        match.scoreB = scoreB !== undefined ? scoreB : match.scoreB;
        match.status = status || match.status;

        const updatedMatch = await match.save();

        // For knockout: Auto advance winner? (Keeping simple for now, can implement if needed)

        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    generateFixtures,
    getMatches,
    updateScore,
    getUpcomingMatches,
    getMatchHistory,
};
