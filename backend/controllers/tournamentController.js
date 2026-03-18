const Tournament = require('../models/Tournament');
const Booking = require('../models/Booking');

// @desc    Create a new tournament
// @route   POST /api/tournaments/create
// @access  Private (Organizer)
const createTournament = async (req, res) => {
    try {
        const { name, sport, location, format, numberOfTeams, startDate } = req.body;

        if (!name || !sport || !location || !format || !numberOfTeams || !startDate) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Not authorized, organizers only' });
        }

        const tournament = await Tournament.create({
            name,
            sport,
            location,
            format,
            numberOfTeams,
            startDate,
            organizerId: req.user.id,
        });

        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
    try {
        let query = {};
        if (req.query.sport) {
            query.sport = { $regex: new RegExp(req.query.sport, 'i') };
        }

        const tournaments = await Tournament.find(query)
            .populate('organizerId', 'name email')
            .populate('registeredParticipants', 'name email');
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get tournaments for logged in participant
// @route   GET /api/tournaments/my-tournaments
// @access  Private
const getMyTournaments = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        const tournaments = await Tournament.find({
            registeredParticipants: req.user._id
        }).populate('organizerId', 'name email');

        return res.status(200).json(tournaments || []);
    } catch (error) {
        console.error("Error in getMyTournaments:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('organizerId', 'name email');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.status(200).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Organizer who created it)
const deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the tournament organizer
        if (tournament.organizerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await tournament.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Join tournament
// @route   POST /api/tournaments/:id/join
// @access  Private (Participant)
const joinTournament = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const userId = req.user && (req.user.id || req.user._id);

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Only participants can join
        if (req.user.role !== 'participant') {
            return res.status(403).json({ message: 'Only participants can join tournaments' });
        }

        if (!tournament.registeredParticipants) {
            tournament.registeredParticipants = [];
        }

        // Check if already joined
        if (tournament.registeredParticipants.includes(userId)) {
            return res.status(400).json({ message: 'Already joined' });
        }

        // Check if full
        if (tournament.registeredParticipants.length >= tournament.maxParticipants) {
            return res.status(400).json({ message: 'Tournament full' });
        }

        // Create booking
        let booking = null;
        try {
            const tokenCode = 'TKN-' + Math.floor(10000 + Math.random() * 90000);
            booking = await Booking.create({
                userId: userId,
                tournamentId: tournament._id,
                tokenCode,
                sport: tournament.sport,
                venue: tournament.location,
                matchTime: tournament.matchTime || "TBD"
            });
        } catch (bookingError) {
            console.error("Booking Error:", bookingError);
            // Optionally continue or fail here. Let's continue to allow joining
        }

        tournament.registeredParticipants.push(userId);
        await tournament.save();

        res.status(200).json({
            message: 'Joined tournament successfully',
            tournament,
            booking
        });
    } catch (error) {
        console.error("JOIN ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createTournament,
    getTournaments,
    getTournamentById,
    deleteTournament,
    joinTournament,
    getMyTournaments,
};
