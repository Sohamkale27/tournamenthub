/**
 * TournamentHub Main Script
 * Handles dynamic UI updates, simulated data fetching, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 17, 26, 0.8)';
                navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            } else {
                navbar.style.background = 'var(--glass-bg)';
                navbar.style.borderBottom = '1px solid var(--glass-border)';
            }
        });
    }

    // 2. Populate Dashboard Tournaments (Simulation)
    const tList = document.getElementById('tournament-list');
    if (tList) {
        const tournaments = [
            { name: "Valorant Champions Qualifier", date: "Oct 15, 2026", status: "Upcoming", prize: "$5,000" },
            { name: "CS:GO Masters League", date: "Nov 02, 2026", status: "Registration Open", prize: "$10,000" },
            { name: "Weekly Smash Brawl", date: "Oct 20, 2026", status: "Upcoming", prize: "$500" }
        ];

        tList.innerHTML = '';
        tournaments.forEach((t, i) => {
            // Apply slight stagger animation
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'tournament-item fade-in-up';
                div.innerHTML = `
                    <div class="t-info">
                        <h4>${t.name}</h4>
                        <p>${t.date} • <span style="color: var(--primary-light)">${t.status}</span></p>
                    </div>
                    <div class="t-action">
                        <span style="margin-right: 15px; font-weight: 600;">${t.prize}</span>
                        <button class="btn btn-secondary btn-sm">Details</button>
                    </div>
                `;
                tList.appendChild(div);
            }, i * 150);
        });
    }

    // 3. Populate Leaderboard (Simulation)
    const lBody = document.getElementById('leaderboard-body');
    if (lBody) {
        const players = [
            { name: "Faker_Fan", game: "League of Legends", winRate: "72.4%", points: 4250 },
            { name: "S1mple_Aim", game: "CS:GO", winRate: "68.9%", points: 3980 },
            { name: "TenZ_Clone", game: "Valorant", winRate: "65.2%", points: 3750 },
            { name: "SmashGod", game: "Super Smash Bros", winRate: "81.0%", points: 3420 },
            { name: "RocketKing", game: "Rocket League", winRate: "59.5%", points: 3100 },
        ];

        lBody.innerHTML = '';
        players.forEach((p, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            setTimeout(() => {
                const tr = document.createElement('tr');
                tr.className = 'fade-in-up';
                tr.innerHTML = `
                    <td class="${rankClass}"><span class="rank-badge">${rank}</span></td>
                    <td style="font-weight: 500;">${p.name}</td>
                    <td style="color: var(--text-muted);">${p.game}</td>
                    <td>${p.winRate}</td>
                    <td style="color: var(--primary-light); font-weight: 600;">${p.points}</td>
                `;
                lBody.appendChild(tr);
            }, index * 100);
        });
        
        // Simple search filter simulation
        const searchInput = document.getElementById('search-player');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = lBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const name = row.cells[1].textContent.toLowerCase();
                    row.style.display = name.includes(term) ? '' : 'none';
                });
            });
        }
    }
});
