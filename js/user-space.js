// User Space - Game Stats & Sanctions System

let userData = {
    email: localStorage.getItem('userEmail') || 'utilisateur@example.com',
    profile: {
        username: localStorage.getItem('username') || 'Utilisateur',
        joinDate: localStorage.getItem('joinDate') || new Date().toLocaleDateString('fr-FR'),
        accountStatus: 'active'
    },
    games: [
        {
            id: 1,
            name: 'Nantes RP',
            playtime: 145,
            lastPlayed: '03/06/2026 14:30',
            sanctions: [
                { id: 1, type: 'warning', reason: 'Spam dans le chat', date: '01/06/2026', duration: 'permanent' },
                { id: 2, type: 'ban_7d', reason: 'Comportement toxique', date: '02/06/2026', expiresAt: '09/06/2026' }
            ]
        },
        {
            id: 2,
            name: 'D.C.P',
            playtime: 87,
            lastPlayed: '02/06/2026 19:45',
            sanctions: [
                { id: 3, type: 'warning', reason: 'Utilisation de glitch', date: '15/05/2026', duration: 'permanent' }
            ]
        },
        {
            id: 3,
            name: 'Prison Life',
            playtime: 234,
            lastPlayed: '03/06/2026 10:15',
            sanctions: []
        }
    ],
    globalStats: {
        totalPlaytime: 466,
        totalGames: 3,
        totalWarnings: 2,
        totalBans: 1,
        accountCreated: localStorage.getItem('joinDate') || '01/06/2026'
    }
};

// ===== DATA MANAGEMENT =====
const loadUserData = () => {
    const stored = localStorage.getItem('userData');
    if (stored) {
        userData = JSON.parse(stored);
    } else {
        saveUserData();
    }
};

const saveUserData = () => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

// ===== PROFILE SECTION =====
const setupProfile = () => {
    const profileSection = document.querySelector('[data-section="profile"]');
    if (!profileSection) return;

    const totalWarnings = userData.games.reduce((sum, game) => 
        sum + game.sanctions.filter(s => s.type === 'warning').length, 0
    );
    const totalBans = userData.games.reduce((sum, game) => 
        sum + game.sanctions.filter(s => s.type.includes('ban')).length, 0
    );

    profileSection.innerHTML = `
        <div class="profile-card">
            <h3>Profil</h3>
            <div class="profile-info">
                <p><strong>Pseudo :</strong> ${userData.profile.username}</p>
                <p><strong>Email :</strong> ${userData.email}</p>
                <p><strong>Compte créé :</strong> ${userData.profile.joinDate}</p>
                <p><strong>Statut :</strong> <span class="status-active">${userData.profile.accountStatus.toUpperCase()}</span></p>
            </div>

            <div class="stats-overview">
                <h4>Statistiques Globales</h4>
                <div class="stats-grid">
                    <div class="stat-box">
                        <strong>${userData.globalStats.totalPlaytime}h</strong>
                        <p>Temps total</p>
                    </div>
                    <div class="stat-box">
                        <strong>${userData.globalStats.totalGames}</strong>
                        <p>Jeux joués</p>
                    </div>
                    <div class="stat-box">
                        <strong>${totalWarnings}</strong>
                        <p>Avertissements</p>
                    </div>
                    <div class="stat-box">
                        <strong>${totalBans}</strong>
                        <p>Bans actifs</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ===== GAMES PLAYTIME SECTION =====
const setupGames = () => {
    const gamesSection = document.querySelector('[data-section="games"]');
    if (!gamesSection) return;

    gamesSection.innerHTML = `
        <div class="games-section">
            <h3>Temps de Jeu par Jeu</h3>
            ${userData.games.map(game => {
                const activeBans = game.sanctions.filter(s => s.type.includes('ban')).length;
                const warnings = game.sanctions.filter(s => s.type === 'warning').length;
                return `
                    <div class="game-card">
                        <div class="game-header">
                            <h4>${game.name}</h4>
                            <span class="playtime-badge">${game.playtime}h</span>
                        </div>
                        <div class="game-stats">
                            <p>Dernière connexion: ${game.lastPlayed}</p>
                            <p>Avertissements: <span class="warning-count">${warnings}</span></p>
                            <p>Bans actifs: <span class="ban-count">${activeBans}</span></p>
                        </div>
                        <button class="btn-small" onclick="viewGameSanctions(${game.id})">Voir sanctions</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

// ===== SANCTIONS SECTION =====
const setupSanctions = () => {
    const sanctionsSection = document.querySelector('[data-section="sanctions"]');
    if (!sanctionsSection) return;

    const allSanctions = [];
    userData.games.forEach(game => {
        game.sanctions.forEach(sanction => {
            allSanctions.push({
                ...sanction,
                gameName: game.name,
                gameId: game.id
            });
        });
    });

    allSanctions.sort((a, b) => new Date(b.date) - new Date(a.date));

    sanctionsSection.innerHTML = `
        <div class="sanctions-section">
            <h3>Sanctions & Avertissements</h3>
            ${allSanctions.length === 0 ? '<p class="clean-record">✅ Aucune sanction - Excellent comportement!</p>' : `
                <div class="sanctions-list">
                    ${allSanctions.map(s => `
                        <div class="sanction-item sanction-${s.type}">
                            <div class="sanction-header">
                                <span class="sanction-type">${getSanctionLabel(s.type)}</span>
                                <span class="sanction-game">${s.gameName}</span>
                                <span class="sanction-date">${s.date}</span>
                            </div>
                            <p class="sanction-reason"><strong>Raison :</strong> ${s.reason}</p>
                            <p class="sanction-duration"><strong>Durée :</strong> ${s.duration || s.expiresAt}</p>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
};

const getSanctionLabel = (type) => {
    const labels = {
        'warning': '⚠️ Avertissement',
        'ban_7d': '🚫 Ban 7 jours',
        'ban_30d': '🚫 Ban 30 jours',
        'ban_permanent': '🔒 Ban Permanent',
        'mute': '🔇 Mute Chat',
        'account_restricted': '⛔ Compte Restreint'
    };
    return labels[type] || type;
};

const viewGameSanctions = (gameId) => {
    const game = userData.games.find(g => g.id === gameId);
    if (!game) return;

    const sanctionTab = document.querySelector('.user-tab-btn[data-section="sanctions"]');
    if (sanctionTab) {
        sanctionTab.click();
    }
};

// ===== PROFILE ADVANCED =====
const setupAccount = () => {
    const accountSection = document.querySelector('[data-section="account"]');
    if (!accountSection) return;

    accountSection.innerHTML = `
        <div class="account-section">
            <h3>Paramètres du Compte</h3>
            
            <div class="settings-group">
                <h4>Informations</h4>
                <p>Pseudo: <strong>${userData.profile.username}</strong></p>
                <p>Email: <strong>${userData.email}</strong></p>
                <button class="btn" id="change-username-btn">Changer le pseudo</button>
            </div>

            <div class="settings-group">
                <h4>Sécurité</h4>
                <button class="btn" id="change-password-btn">Changer le mot de passe</button>
                <button class="btn" id="two-factor-btn">Activer 2FA</button>
            </div>

            <div class="settings-group">
                <h4>Données</h4>
                <button class="btn" id="export-btn">Exporter mes données</button>
                <button class="btn btn-danger" id="logout-btn">Se déconnecter</button>
            </div>
        </div>
    `;

    const changeUsernameBtn = document.getElementById('change-username-btn');
    if (changeUsernameBtn) {
        changeUsernameBtn.addEventListener('click', () => {
            const newUsername = prompt('Entrez votre nouveau pseudo:', userData.profile.username);
            if (newUsername && newUsername.trim()) {
                userData.profile.username = newUsername.trim();
                localStorage.setItem('username', newUsername.trim());
                saveUserData();
                setupAccount();
                setupProfile();
            }
        });
    }

    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            alert('Changement de mot de passe - Fonctionnalité en développement');
        });
    }

    const twoFactorBtn = document.getElementById('two-factor-btn');
    if (twoFactorBtn) {
        twoFactorBtn.addEventListener('click', () => {
            alert('2FA activé avec succès!');
        });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(userData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
            alert('Déconnexion...');
            window.location.href = 'login.html';
        });
    }
};

// ===== TAB SWITCHING =====
const setupUserTabs = () => {
    document.querySelectorAll('.user-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sectionName = e.target.dataset.section;

            document.querySelectorAll('.user-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('[data-section]').forEach(s => s.style.display = 'none');

            e.target.classList.add('active');
            const section = document.querySelector(`[data-section="${sectionName}"]`);
            if (section) {
                section.style.display = 'block';
            }

            switch (sectionName) {
                case 'profile':
                    setupProfile();
                    break;
                case 'games':
                    setupGames();
                    break;
                case 'sanctions':
                    setupSanctions();
                    break;
                case 'account':
                    setupAccount();
                    break;
            }
        });
    });

    const firstTab = document.querySelector('.user-tab-btn');
    if (firstTab) {
        firstTab.classList.add('active');
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    setupUserTabs();
    setupProfile();
});

