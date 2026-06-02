// User Space Functionalities
let userData = {
    email: localStorage.getItem('userEmail') || 'utilisateur@example.com',
    profile: {
        username: 'Utilisateur',
        joinDate: new Date().toLocaleDateString('fr-FR'),
        games: ['Nantes RP', 'D.C.P'],
        playtime: '145h 30m'
    },
    tickets: [],
    notifications: []
};

// Setup profile section
const setupProfile = () => {
    const profileSection = document.querySelector('[data-section="profile"]');
    if (!profileSection) return;

    profileSection.innerHTML = `
        <div class="profile-card">
            <h3>Votre profil</h3>
            <div class="profile-info">
                <p><strong>Email :</strong> ${userData.email}</p>
                <p><strong>Pseudo :</strong> ${userData.profile.username}</p>
                <p><strong>Inscrit depuis :</strong> ${userData.profile.joinDate}</p>
                <p><strong>Temps de jeu :</strong> ${userData.profile.playtime}</p>
            </div>
            <button class="btn" id="edit-profile-btn">Modifier le profil</button>
        </div>
    `;

    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const newUsername = prompt('Entrez votre nouveau pseudo:', userData.profile.username);
            if (newUsername) {
                userData.profile.username = newUsername;
                localStorage.setItem('userData', JSON.stringify(userData));
                setupProfile();
            }
        });
    }
};

// Setup games section
const setupGames = () => {
    const gamesSection = document.querySelector('[data-section="games"]');
    if (!gamesSection) return;

    gamesSection.innerHTML = `
        <div class="games-list">
            <h3>Mes jeux</h3>
            ${userData.profile.games.map(game => `
                <div class="game-item">
                    <h4>${game}</h4>
                    <button class="btn-small">Jouer</button>
                </div>
            `).join('')}
        </div>
    `;
};

// Setup support section
const setupSupport = () => {
    const supportSection = document.querySelector('[data-section="support"]');
    if (!supportSection) return;

    supportSection.innerHTML = `
        <div class="support-section">
            <h3>Support client</h3>
            <div class="ticket-form">
                <textarea id="ticket-message" placeholder="Décrivez votre problème..."></textarea>
                <button class="btn" id="create-ticket-btn">Créer un ticket</button>
            </div>
            <div id="tickets-list" class="tickets-list"></div>
        </div>
    `;

    const createTicketBtn = document.getElementById('create-ticket-btn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', () => {
            const message = document.getElementById('ticket-message');
            if (message && message.value.trim()) {
                const ticket = {
                    id: Date.now(),
                    created: new Date().toLocaleDateString('fr-FR'),
                    message: message.value,
                    status: 'En attente'
                };
                userData.tickets.push(ticket);
                localStorage.setItem('userData', JSON.stringify(userData));
                message.value = '';
                setupSupport();
            }
        });
    }

    const ticketsList = document.getElementById('tickets-list');
    if (ticketsList) {
        if (userData.tickets.length === 0) {
            ticketsList.innerHTML = '<p>Aucun ticket pour le moment.</p>';
        } else {
            ticketsList.innerHTML = userData.tickets.map(ticket => `
                <div class="ticket-item">
                    <strong>Ticket #${ticket.id}</strong> - ${ticket.created}
                    <p>${ticket.message}</p>
                    <span class="status">${ticket.status}</span>
                </div>
            `).join('');
        }
    }
};

// Setup account section
const setupAccount = () => {
    const accountSection = document.querySelector('[data-section="account"]');
    if (!accountSection) return;

    accountSection.innerHTML = `
        <div class="account-section">
            <h3>Paramètres du compte</h3>
            <label>
                <input type="checkbox" id="notifications-check" checked>
                Recevoir les notifications
            </label>
            <button class="btn" id="change-password-btn">Changer le mot de passe</button>
            <button class="btn" id="logout-btn">Se déconnecter</button>
        </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        });
    }
};

// Tab switching
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
                case 'support':
                    setupSupport();
                    break;
                case 'account':
                    setupAccount();
                    break;
            }
        });
    });
};

// Initialize user space
document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('userData');
    if (stored) {
        userData = JSON.parse(stored);
    } else {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    setupUserTabs();
    setupProfile();
});
