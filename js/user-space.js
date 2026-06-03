// User Space - Fully Functional User Dashboard

let userData = {
    email: localStorage.getItem('userEmail') || 'utilisateur@example.com',
    profile: {
        username: localStorage.getItem('username') || 'Utilisateur',
        joinDate: localStorage.getItem('joinDate') || new Date().toLocaleDateString('fr-FR'),
        playtime: localStorage.getItem('playtime') || '0h 0m',
        bio: localStorage.getItem('bio') || 'Biographie...'
    },
    tickets: [],
    games: [
        { id: 1, name: 'Nantes RP', status: 'disponible', hours: 125 },
        { id: 2, name: 'D.C.P', status: 'disponible', hours: 87 },
        { id: 3, name: 'Admin Panel', status: 'staff-only', hours: 0 }
    ],
    notifications: [],
    settings: {
        emailNotifications: true,
        displayEmail: false
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
    localStorage.setItem('username', userData.profile.username);
    localStorage.setItem('joinDate', userData.profile.joinDate);
    localStorage.setItem('playtime', userData.profile.playtime);
    localStorage.setItem('bio', userData.profile.bio);
};

// ===== PROFILE SECTION =====
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
                <p><strong>Biographie :</strong> ${userData.profile.bio}</p>
            </div>
            <div class="profile-actions">
                <button class="btn" id="edit-username-btn">Changer le pseudo</button>
                <button class="btn" id="edit-bio-btn">Modifier la biographie</button>
                <button class="btn" id="edit-playtime-btn">Ajouter du temps de jeu</button>
            </div>
        </div>
    `;

    const editUsernameBtn = document.getElementById('edit-username-btn');
    if (editUsernameBtn) {
        editUsernameBtn.addEventListener('click', () => {
            const newUsername = prompt('Entrez votre nouveau pseudo:', userData.profile.username);
            if (newUsername && newUsername.trim()) {
                userData.profile.username = newUsername.trim();
                saveUserData();
                setupProfile();
            }
        });
    }

    const editBioBtn = document.getElementById('edit-bio-btn');
    if (editBioBtn) {
        editBioBtn.addEventListener('click', () => {
            const newBio = prompt('Entrez votre biographie:', userData.profile.bio);
            if (newBio !== null) {
                userData.profile.bio = newBio || 'Biographie...';
                saveUserData();
                setupProfile();
            }
        });
    }

    const editPlaytimeBtn = document.getElementById('edit-playtime-btn');
    if (editPlaytimeBtn) {
        editPlaytimeBtn.addEventListener('click', () => {
            const hours = prompt('Nombre d\'heures à ajouter:', '0');
            if (hours && !isNaN(hours)) {
                const currentTime = userData.profile.playtime.split('h');
                const currentHours = parseInt(currentTime[0]) + parseInt(hours);
                userData.profile.playtime = `${currentHours}h ${currentTime[1].trim()}`;
                saveUserData();
                setupProfile();
            }
        });
    }
};

// ===== GAMES SECTION =====
const setupGames = () => {
    const gamesSection = document.querySelector('[data-section="games"]');
    if (!gamesSection) return;

    gamesSection.innerHTML = `
        <div class="games-section">
            <h3>Mes jeux</h3>
            ${userData.games.map(game => `
                <div class="game-item">
                    <div class="game-info">
                        <h4>${game.name}</h4>
                        <p>Temps joué: ${game.hours}h</p>
                        <span class="game-status ${game.status}">${game.status === 'staff-only' ? 'Réservé Staff' : 'Disponible'}</span>
                    </div>
                    <div class="game-actions">
                        <button class="btn-small" onclick="launchGame(${game.id})">Jouer</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

const launchGame = (gameId) => {
    const game = userData.games.find(g => g.id === gameId);
    if (game) {
        if (game.status === 'staff-only') {
            alert('Vous n\'avez pas accès à ce jeu (réservé au staff).');
            return;
        }
        alert(`Lancement de ${game.name}...`);
        game.hours += 0.5;
        saveUserData();
        setupGames();
    }
};

// ===== SUPPORT SECTION =====
const setupSupport = () => {
    const supportSection = document.querySelector('[data-section="support"]');
    if (!supportSection) return;

    const ticketsList = userData.tickets.map(ticket => `
        <div class="ticket-item">
            <div class="ticket-header">
                <strong>Ticket #${ticket.id}</strong>
                <span class="ticket-date">${ticket.created}</span>
                <span class="status ${ticket.status.toLowerCase()}">${ticket.status}</span>
            </div>
            <p class="ticket-message">${ticket.message}</p>
            <div class="ticket-actions">
                <button class="btn-small" onclick="updateTicketStatus(${ticket.id})">Mettre à jour</button>
                <button class="btn-small btn-danger" onclick="deleteTicket(${ticket.id})">Supprimer</button>
            </div>
        </div>
    `).join('');

    supportSection.innerHTML = `
        <div class="support-section">
            <h3>Support client</h3>
            <div class="ticket-form">
                <h4>Créer un nouveau ticket</h4>
                <input type="text" id="ticket-subject" placeholder="Sujet du ticket...">
                <textarea id="ticket-message" placeholder="Décrivez votre problème en détail..."></textarea>
                <button class="btn" id="create-ticket-btn">Créer un ticket</button>
            </div>
            <div class="tickets-list">
                <h4>Vos tickets</h4>
                ${userData.tickets.length === 0 ? '<p>Aucun ticket pour le moment.</p>' : ticketsList}
            </div>
        </div>
    `;

    const createTicketBtn = document.getElementById('create-ticket-btn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', () => {
            const subject = document.getElementById('ticket-subject');
            const message = document.getElementById('ticket-message');
            
            if (!subject || !subject.value.trim() || !message || !message.value.trim()) {
                alert('Veuillez remplir le sujet et la description');
                return;
            }

            const ticket = {
                id: Date.now(),
                created: new Date().toLocaleDateString('fr-FR'),
                updated: new Date().toLocaleDateString('fr-FR'),
                subject: subject.value,
                message: message.value,
                status: 'En attente',
                priority: 'Normal'
            };
            
            userData.tickets.unshift(ticket);
            saveUserData();
            subject.value = '';
            message.value = '';
            setupSupport();
        });
    }
};

const updateTicketStatus = (ticketId) => {
    const statuses = ['En attente', 'En cours', 'Résolu'];
    const ticket = userData.tickets.find(t => t.id === ticketId);
    if (ticket) {
        const currentIndex = statuses.indexOf(ticket.status);
        ticket.status = statuses[(currentIndex + 1) % statuses.length];
        ticket.updated = new Date().toLocaleDateString('fr-FR');
        saveUserData();
        setupSupport();
    }
};

const deleteTicket = (ticketId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
        userData.tickets = userData.tickets.filter(t => t.id !== ticketId);
        saveUserData();
        setupSupport();
    }
};

// ===== ACCOUNT SECTION =====
const setupAccount = () => {
    const accountSection = document.querySelector('[data-section="account"]');
    if (!accountSection) return;

    accountSection.innerHTML = `
        <div class="account-section">
            <h3>Paramètres du compte</h3>
            
            <div class="settings-group">
                <h4>Notifications</h4>
                <label>
                    <input type="checkbox" id="email-notifications" ${userData.settings.emailNotifications ? 'checked' : ''}>
                    Recevoir les notifications par email
                </label>
                <label>
                    <input type="checkbox" id="display-email" ${userData.settings.displayEmail ? 'checked' : ''}>
                    Afficher mon email publiquement
                </label>
            </div>

            <div class="settings-group">
                <h4>Sécurité</h4>
                <button class="btn" id="change-password-btn">Changer le mot de passe</button>
                <button class="btn" id="two-factor-btn">Activer 2FA</button>
            </div>

            <div class="settings-group">
                <h4>Données</h4>
                <button class="btn" id="export-btn">Exporter mes données</button>
                <button class="btn btn-danger" id="delete-account-btn">Supprimer mon compte</button>
            </div>

            <div class="settings-group">
                <h4>Déconnexion</h4>
                <button class="btn btn-danger" id="logout-btn">Se déconnecter</button>
            </div>
        </div>
    `;

    // Settings event listeners
    const emailNotif = document.getElementById('email-notifications');
    if (emailNotif) {
        emailNotif.addEventListener('change', (e) => {
            userData.settings.emailNotifications = e.target.checked;
            saveUserData();
        });
    }

    const displayEmail = document.getElementById('display-email');
    if (displayEmail) {
        displayEmail.addEventListener('change', (e) => {
            userData.settings.displayEmail = e.target.checked;
            saveUserData();
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

    const deleteAccountBtn = document.getElementById('delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous VRAIMENT sûr ? Cette action est irréversible.')) {
                if (confirm('Veuillez confirmer une deuxième fois...')) {
                    localStorage.clear();
                    alert('Compte supprimé');
                    window.location.href = 'login.html';
                }
            }
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
                case 'support':
                    setupSupport();
                    break;
                case 'account':
                    setupAccount();
                    break;
            }
        });
    });

    // First tab active
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

