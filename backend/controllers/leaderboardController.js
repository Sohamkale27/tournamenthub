const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Get leaderboard for a specific tournament
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
                goalsFor: 0,
                goalsAgainst: 0,
            };
        });

        // Calculate stats from finished matches
        matches.forEach(match => {
            const { teamA, teamB, scoreA, scoreB } = match;

            if (!teamA || !teamB) return;

            const statsA = leaderboardMap[teamA];
            const statsB = leaderboardMap[teamB];

            if (!statsA || !statsB) return;

            statsA.matchesPlayed += 1;
            statsB.matchesPlayed += 1;
            statsA.goalsFor += (scoreA || 0);
            statsA.goalsAgainst += (scoreB || 0);
            statsB.goalsFor += (scoreB || 0);
            statsB.goalsAgainst += (scoreA || 0);

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

        // Convert map to sorted array
        const leaderboard = Object.values(leaderboardMap)
            .map(entry => ({
                ...entry,
                winRate: entry.matchesPlayed > 0
                    ? Math.round((entry.wins / entry.matchesPlayed) * 100)
                    : 0,
                goalDiff: entry.goalsFor - entry.goalsAgainst,
            }))
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                return a.teamName.localeCompare(b.teamName);
            });

        res.status(200).json(leaderboard);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get global leaderboard (all teams across all tournaments)
// @route   GET /api/leaderboard
// @access  Public
const getGlobalLeaderboard = async (req, res) => {
    try {
        const Team = require('../models/Team');
        const Match = require('../models/Match');
        const Tournament = require('../models/Tournament');

        let teamFilter = {};
        // If sport filter is provided, find tournaments of that sport
        if (req.query.sport) {
            const sportTournaments = await Tournament.find({
                sport: { $regex: new RegExp(req.query.sport, 'i') }
            }).select('_id');
            const tournamentIds = sportTournaments.map(t => t._id);
            teamFilter = { tournamentId: { $in: tournamentIds } };
        }

        const teams = await Team.find(teamFilter);
        const matches = await Match.find({ status: 'finished' });

        const leaderboardMap = {};
        teams.forEach(team => {
            leaderboardMap[team._id] = {
                teamId: team._id,
                team: team.teamName,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0,
            };
        });

        matches.forEach(match => {
            const { teamA, teamB, scoreA, scoreB } = match;
            if (!teamA || !teamB) return;

            const statsA = leaderboardMap[teamA];
            const statsB = leaderboardMap[teamB];

            if (!statsA || !statsB) return;

            statsA.matchesPlayed += 1;
            statsB.matchesPlayed += 1;
            statsA.goalsFor += (scoreA || 0);
            statsA.goalsAgainst += (scoreB || 0);
            statsB.goalsFor += (scoreB || 0);
            statsB.goalsAgainst += (scoreA || 0);

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

        const leaderboard = Object.values(leaderboardMap)
            .map(entry => ({
                ...entry,
                winRate: entry.matchesPlayed > 0
                    ? Math.round((entry.wins / entry.matchesPlayed) * 100)
                    : 0,
                goalDiff: entry.goalsFor - entry.goalsAgainst,
            }))
            .sort((a, b) => b.points - a.points || b.wins - a.wins || b.goalDiff - a.goalDiff);

        return res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error in getGlobalLeaderboard:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getLeaderboard,
    getGlobalLeaderboard
};
