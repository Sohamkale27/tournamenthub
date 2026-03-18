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

    // 2. Fetch and Populate Dashboard Tournaments
    const tList = document.getElementById('tournament-list');
    if (tList) {
        tList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">Loading tournaments...</div>';

        fetch('http://localhost:5000/api/tournaments')
            .then(res => res.json())
            .then(tournaments => {
                tList.innerHTML = '';
                if (tournaments.length === 0) {
                    tList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">No tournaments available right now.</div>';
                    return;
                }
                tournaments.forEach((t, i) => {
                    setTimeout(() => {
                        const div = document.createElement('div');
                        div.className = 'tournament-item fade-in-up';
                        const date = new Date(t.startDate).toLocaleDateString();
                        div.innerHTML = `
                            <div class="t-info">
                                <h4>${t.name}</h4>
                                <p>${date} • <span style="color: var(--primary-light)">${t.sport} (${t.format})</span></p>
                            </div>
                            <div class="t-action">
                                <button class="btn btn-secondary btn-sm" onclick="window.location.href='leaderboard.html?tournamentId=${t._id}'">View Leaderboard</button>
                            </div>
                        `;
                        tList.appendChild(div);
                    }, i * 150);
                });
            })
            .catch(err => {
                tList.innerHTML = '<div style="color:#ff4d4f; text-align:center; padding: 20px;">Error loading tournaments.</div>';
            });
    }

    // 3. Fetch and Populate Leaderboard Dynamic Data
    const lBody = document.getElementById('leaderboard-body');
    if (lBody) {
        const urlParams = new URLSearchParams(window.location.search);
        const tId = urlParams.get('tournamentId');

        if (!tId) {
            lBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Please select a tournament to view its leaderboard.</td></tr>';
        } else {
            lBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading leaderboard...</td></tr>';

            fetch(`http://localhost:5000/api/leaderboard/${tId}`)
                .then(res => res.json())
                .then(players => {
                    lBody.innerHTML = '';
                    if (players.length === 0) {
                        lBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No leaderboard data available for this tournament yet.</td></tr>';
                        return;
                    }
                    players.forEach((p, index) => {
                        const rank = index + 1;
                        let rowClass = '';
                        if (rank === 1) rowClass = 'row-gold';
                        else if (rank === 2) rowClass = 'row-silver';
                        else if (rank === 3) rowClass = 'row-bronze';

                        setTimeout(() => {
                            const tr = document.createElement('tr');
                            tr.className = rowClass + ' fade-in-up';
                            const initials = p.teamName.substring(0, 2).toUpperCase();
                            tr.innerHTML = `
                                <td class="rank">#${rank}</td>
                                <td>
                                    <div class="team-info">
                                        <div class="team-logo">${initials}</div>
                                        ${p.teamName}
                                    </div>
                                </td>
                                <td>${p.matchesPlayed}</td>
                                <td>${p.wins}</td>
                                <td>${p.losses}</td>
                                <td>N/A</td> <!-- Goal diff not calculated currently in match model -->
                                <td class="points">${p.points}</td>
                            `;
                            lBody.appendChild(tr);
                        }, index * 100);
                    });
                })
                .catch(err => {
                    lBody.innerHTML = '<tr><td colspan="7" style="color:#ff4d4f; text-align:center;">Error loading leaderboard.</td></tr>';
                });
        }

        // Simple search filter simulation
        const searchInput = document.getElementById('search-player');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = lBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const name = row.cells[1].textContent.toLowerCase();
                    row.style.display = name.includes(term) ? '' : 'none';
                    document.getElementById("createAccountBtn").addEventListener("click", async () => {
                        const name = prompt("Enter your name:");
                        const email = prompt("Enter your email:");
                        const password = prompt("Enter your password:");

                        if (!name || !email || !password) {
                            alert("All fields required");
                            return;
                        }

                        try {
                            const res = await fetch("http://localhost:5000/api/auth/register", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    name,
                                    email,
                                    password
                                })
                            });

                            const data = await res.json();

                            if (res.ok) {
                                alert("Account created successfully! Now login.");
                            } else {
                                alert(data.message || "Registration failed");
                            }

                        } catch (err) {
                            alert("Server error");
                        }
                    });
                });
            });
        }
    }
});
