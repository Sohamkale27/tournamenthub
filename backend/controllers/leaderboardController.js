const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Get leaderboard for a tournament
// @route   GET /api/leaderboard/:tournamentId
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        const teams = await Team.find({ tournamentId });
        const matches = await Match.find({ tournamentId, status: 'finished' });

        // Initialize leaderboard map
        const leaderboardMap = {};
        teams.forEach(team => {
            leaderboardMap[team._id] = {
                teamId: team._id,
                teamName: team.teamName,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0, // 3 for win, 1 for draw, 0 for loss
            };
        });

        // Calculate stats
        matches.forEach(match => {
            const { teamA, teamB, scoreA, scoreB } = match;

            if (!teamA || !teamB) return;

            const statsA = leaderboardMap[teamA];
            const statsB = leaderboardMap[teamB];

            if (!statsA || !statsB) return;

            statsA.matchesPlayed += 1;
            statsB.matchesPlayed += 1;

            if (scoreA > scoreB) {
                statsA.wins += 1;
                statsA.points += 3;
                statsB.losses += 1;
            } else if (scoreB > scoreA) {
                statsB.wins += 1;
                statsB.points += 3;
                statsA.losses += 1;
            } else {
                statsA.draws += 1;
                statsB.draws += 1;
                statsA.points += 1;
                statsB.points += 1;
            }
        });

        // Convert map to array and sort
        const leaderboard = Object.values(leaderboardMap).sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return a.teamName.localeCompare(b.teamName);
        });

        res.status(200).json(leaderboard);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getGlobalLeaderboard = async (req, res) => {
    try {
        const teams = await require('../models/Team').find();
        const matches = await require('../models/Match').find({ status: 'finished' });

        const leaderboardMap = {};
        teams.forEach(team => {
            leaderboardMap[team._id] = {
                team: team.teamName,
                wins: 0,
                losses: 0,
                points: 0,
            };
        });

        matches.forEach(match => {
            const { teamA, teamB, scoreA, scoreB } = match;
            if (!teamA || !teamB) return;

            const statsA = leaderboardMap[teamA];
            const statsB = leaderboardMap[teamB];

            if (!statsA || !statsB) return;

            if (scoreA > scoreB) {
                statsA.wins += 1;
                statsA.points += 3;
                statsB.losses += 1;
            } else if (scoreB > scoreA) {
                statsB.wins += 1;
                statsB.points += 3;
                statsA.losses += 1;
            } else {
                statsA.points += 1;
                statsB.points += 1;
            }
        });

        const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.points - a.points || b.wins - a.wins);

        return res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error in getGlobalLeaderboard:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getLeaderboard,
    getGlobalLeaderboard
};
