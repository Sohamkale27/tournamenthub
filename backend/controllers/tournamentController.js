const Tournament = require('../models/Tournament');
const Booking = require('../models/Booking');

// Reuse a single formatter so ticket/join responses always return demo-ready time text.
const formatTimeToAmPm = (time) => {
    if (!time) return 'TBA';
    const [hour, minute] = String(time).split(':');
    let h = parseInt(hour, 10);

    if (Number.isNaN(h) || minute === undefined) {
        return 'TBA';
    }

    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
};

const formatVenueLabel = (venue, city) => {
    return [venue, city].filter(Boolean).join(', ') || 'TBA';
};

// @desc    Create a new tournament
// @route   POST /api/tournaments/create
// @access  Private (Organizer)
const createTournament = async (req, res) => {
    try {
        const {
            name, sport, location, city, format, numberOfTeams,
            startDate, entryFee, matchTime, description, maxParticipants,
            latitude, longitude
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Tournament name is required.' });
        }
        if (!sport?.trim()) {
            return res.status(400).json({ message: 'Sport is required.' });
        }
        if (!location?.trim()) {
            return res.status(400).json({ message: 'Venue is required.' });
        }
        if (!city?.trim()) {
            return res.status(400).json({ message: 'City is required.' });
        }
        if (!format) {
            return res.status(400).json({ message: 'Tournament format is required.' });
        }
        if (!numberOfTeams) {
            return res.status(400).json({ message: 'Number of teams is required.' });
        }
        if (!startDate) {
            return res.status(400).json({ message: 'Start date is required.' });
        }
        if (!matchTime?.trim()) {
            return res.status(400).json({ message: 'Match time is required.' });
        }

        if (req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Not authorized, organizers only' });
        }

        const parsedLatitude = latitude !== undefined && latitude !== null && latitude !== ''
            ? Number(latitude)
            : null;
        const parsedLongitude = longitude !== undefined && longitude !== null && longitude !== ''
            ? Number(longitude)
            : null;
        const hasCoordinates = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);

        const tournament = await Tournament.create({
            name: name.trim(),
            sport: sport.trim(),
            location: location.trim(),
            city: city.trim(),
            coordinates: hasCoordinates ? {
                lat: parsedLatitude,
                lng: parsedLongitude,
            } : undefined,
            format,
            numberOfTeams: parseInt(numberOfTeams),
            startDate,
            entryFee: entryFee || 0,
            matchTime: matchTime.trim(),
            description: description || '',
            maxParticipants: maxParticipants || parseInt(numberOfTeams) || 16,
            organizerId: req.user.id,
        });

        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all tournaments (for participants to browse)
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
    try {
        let query = {};
        if (req.query.sport) {
            query.sport = { $regex: new RegExp(req.query.sport, 'i') };
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const tournaments = await Tournament.find(query)
            .populate('organizerId', 'name email')
            .populate('participants.user', 'name email')
            .sort({ startDate: 1 });

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
            'participants.user': req.user._id
        })
            .populate('organizerId', 'name email')
            .sort({ startDate: 1 });

        return res.status(200).json(tournaments || []);
    } catch (error) {
        console.error('Error in getMyTournaments:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get tournaments created by logged in organizer
// @route   GET /api/tournaments/organizer-tournaments
// @access  Private (Organizer)
const getOrganizerTournaments = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const tournaments = await Tournament.find({ organizerId: req.user._id })
            .populate('participants.user', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json(tournaments || []);
    } catch (error) {
        console.error('Error in getOrganizerTournaments:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get ticket details by coupon code
// @route   GET /api/tournaments/ticket/:coupon
// @access  Public
const getTicketByCoupon = async (req, res) => {
    try {
        const tournament = await Tournament.findOne({
            'participants.couponCode': req.params.coupon
        }).populate('participants.user', 'name');

        if (!tournament) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const participant = (tournament.participants || []).find(
            (entry) => entry.couponCode === req.params.coupon
        );

        if (!participant) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        return res.status(200).json({
            couponCode: participant.couponCode,
            player: participant.user?.name || 'Participant',
            tournament: {
                name: tournament.name,
                sport: tournament.sport,
                venue: tournament.location || 'TBA',
                city: tournament.city || '',
                venueLabel: formatVenueLabel(tournament.location || '', tournament.city || ''),
                date: tournament.startDate
                    ? new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'TBA',
                time: formatTimeToAmPm(tournament.matchTime),
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('organizerId', 'name email')
            .populate('participants.user', 'name email');
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

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (tournament.organizerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await tournament.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Join tournament and receive a coupon code
// @route   POST /api/tournaments/:id/join
// @access  Private (Participant)
const joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const participants = tournament.participants || [];

        // Check if already joined
        const alreadyJoined = participants.some(
            (p) => p.user.toString() === userId.toString()
        );
        if (alreadyJoined) {
            return res.status(400).json({ message: 'You have already joined this tournament' });
        }

        const maxParticipants = tournament.maxParticipants || 16;
        if (participants.length >= maxParticipants) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        // Generate a unique coupon code
        const couponCode = 'THUB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Push participant entry — use $push to avoid full-document validation
        await Tournament.findByIdAndUpdate(
            req.params.id,
            { $push: { participants: { user: userId, couponCode } } },
            { new: true, runValidators: false }
        );

        // Build a human-readable date and time from startDate
        let date = 'TBA';
        let time = 'TBA';
        if (tournament.startDate) {
            const d = new Date(tournament.startDate);
            date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            time = formatTimeToAmPm(tournament.matchTime) || d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        }

        res.json({
            success: true,
            message: 'Joined tournament successfully',
            couponCode,
            tournament: {
                _id: tournament._id,
                name: tournament.name,
                sport: tournament.sport,
                venue: tournament.location || tournament.venue || 'TBA',
                city: tournament.city || '',
                venueLabel: formatVenueLabel(tournament.location || tournament.venue || '', tournament.city || ''),
                date,
                time,
                startDate: tournament.startDate,
                matchTime: tournament.matchTime || '',
            },
        });

    } catch (error) {
        console.error('JOIN ERROR:', error);
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
    getOrganizerTournaments,
    getTicketByCoupon,
};
