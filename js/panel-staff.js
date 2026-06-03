// Panel Staff - Fully Functional Admin Dashboard

let panelData = {
    users: [],
    logs: [],
    staffEmails: [],
    connections: 0,
    lastAction: new Date()
};

// ===== DATA MANAGEMENT =====
const loadPanelData = () => {
    const stored = localStorage.getItem('panelData');
    if (stored) {
        panelData = JSON.parse(stored);
        panelData.lastAction = new Date(panelData.lastAction);
    } else {
        initializeSampleData();
    }
};

const savePanelData = () => {
    localStorage.setItem('panelData', JSON.stringify(panelData));
};

const initializeSampleData = () => {
    panelData.users = [
        { id: 1, email: 'user1@example.com', username: 'User1', joinDate: '01/06/2026', status: 'active', lastLogin: '03/06/2026 14:30' },
        { id: 2, email: 'user2@example.com', username: 'User2', joinDate: '02/06/2026', status: 'active', lastLogin: '03/06/2026 12:15' },
        { id: 3, email: 'user3@example.com', username: 'User3', joinDate: '01/05/2026', status: 'inactive', lastLogin: '28/05/2026 09:45' }
    ];
    panelData.staffEmails = ['admin@omega.dev', 'staff@omega.dev', 'support@omega.dev'];
    panelData.connections = Math.floor(Math.random() * 150) + 50;
    panelData.logs = [];
    addLog('Initialisation du panel');
    savePanelData();
};

const addLog = (action, details = '') => {
    const now = new Date();
    panelData.logs.unshift({
        timestamp: now.toLocaleTimeString('fr-FR'),
        date: now.toLocaleDateString('fr-FR'),
        action: action,
        details: details
    });
    if (panelData.logs.length > 200) {
        panelData.logs.pop();
    }
    panelData.lastAction = now;
    savePanelData();
};

// ===== STATS MANAGEMENT =====
const updateStats = () => {
    const statsConnections = document.getElementById('stats-connections');
    const statsActive = document.getElementById('stats-active');
    const statsStaff = document.getElementById('stats-staff');
    const statsLast = document.getElementById('stats-last');

    if (statsConnections) statsConnections.textContent = panelData.connections;
    if (statsActive) statsActive.textContent = panelData.users.length;
    if (statsStaff) statsStaff.textContent = panelData.staffEmails.length;
    if (statsLast) statsLast.textContent = panelData.lastAction.toLocaleTimeString('fr-FR');
};

// ===== LOGS DISPLAY =====
const updateLogs = () => {
    const logsList = document.getElementById('logs-list');
    if (!logsList) return;

    if (panelData.logs.length === 0) {
        logsList.innerHTML = '<p>Aucun log pour le moment.</p>';
        return;
    }

    logsList.innerHTML = panelData.logs.map(log => `
        <div class="log-entry">
            <span class="log-time">${log.timestamp}</span>
            <span class="log-date">${log.date}</span>
            <span class="log-action">${log.action}</span>
            ${log.details ? `<span class="log-details">${log.details}</span>` : ''}
        </div>
    `).join('');
};

// ===== TAB SWITCHING =====
const setupTabButtons = () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            e.target.classList.add('active');
            const content = document.getElementById(tabName);
            if (content) {
                content.classList.add('active');
            }

            addLog(`Accès à l'onglet: ${tabName}`);
            updateStats();
            updateLogs();
        });
    });
};

// ===== USERS MANAGEMENT =====
const displayUsers = (filter = '') => {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;

    let filteredUsers = panelData.users;
    if (filter.trim()) {
        filteredUsers = panelData.users.filter(u => 
            u.email.toLowerCase().includes(filter.toLowerCase()) || 
            u.username.toLowerCase().includes(filter.toLowerCase())
        );
    }

    if (filteredUsers.length === 0) {
        usersList.innerHTML = '<p>Aucun utilisateur trouvé.</p>';
        return;
    }

    usersList.innerHTML = filteredUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <strong>${user.username}</strong>
                <p>${user.email}</p>
                <small>Inscrit: ${user.joinDate} | Statut: ${user.status}</small>
            </div>
            <div class="user-actions">
                <button class="btn-small" onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'active' ? 'Désactiver' : 'Activer'}
                </button>
                <button class="btn-small btn-danger" onclick="deleteUser(${user.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
};

const toggleUserStatus = (userId) => {
    const user = panelData.users.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        addLog(`Utilisateur ${user.username} ${user.status === 'active' ? 'activé' : 'désactivé'}`);
        savePanelData();
        displayUsers(document.getElementById('user-search')?.value || '');
        updateStats();
        updateLogs();
    }
};

const deleteUser = (userId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        const user = panelData.users.find(u => u.id === userId);
        if (user) {
            panelData.users = panelData.users.filter(u => u.id !== userId);
            addLog(`Utilisateur ${user.username} supprimé`);
            savePanelData();
            displayUsers(document.getElementById('user-search')?.value || '');
            updateStats();
            updateLogs();
        }
    }
};

const setupUserSearch = () => {
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            displayUsers(e.target.value);
        });
    }
    displayUsers();
};

// ===== STAFF EMAILS MANAGEMENT =====
const loadStaffList = () => {
    const staffList = document.getElementById('staff-list');
    if (!staffList) return;

    if (panelData.staffEmails.length === 0) {
        staffList.innerHTML = '<p>Aucun email staff enregistré.</p>';
        return;
    }

    staffList.innerHTML = panelData.staffEmails.map((email, idx) => `
        <div class="staff-item">
            <span>${email}</span>
            <button class="btn-small btn-danger" onclick="removeStaffEmail(${idx})">Supprimer</button>
        </div>
    `).join('');
};

const addStaffEmail = () => {
    const input = document.getElementById('new-staff-email');
    if (!input || !input.value.trim()) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    const email = input.value.trim().toLowerCase();
    
    if (!email.includes('@')) {
        alert('Email invalide');
        return;
    }

    if (panelData.staffEmails.includes(email)) {
        alert('Cet email est déjà enregistré');
        return;
    }

    panelData.staffEmails.push(email);
    addLog('Email staff ajouté', email);
    savePanelData();
    input.value = '';
    loadStaffList();
    updateStats();
    updateLogs();
};

const removeStaffEmail = (index) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${panelData.staffEmails[index]} ?`)) {
        const removed = panelData.staffEmails[index];
        panelData.staffEmails.splice(index, 1);
        addLog('Email staff supprimé', removed);
        savePanelData();
        loadStaffList();
        updateStats();
        updateLogs();
    }
};

// ===== SETTINGS =====
const setupSettings = () => {
    const exportBtn = document.getElementById('export-btn');
    const resetBtn = document.getElementById('reset-btn');
    const autoRefresh = document.getElementById('auto-refresh');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(panelData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `panel-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            addLog('Données exportées');
            savePanelData();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les données ?')) {
                panelData = { users: [], logs: [], staffEmails: [], connections: 0, lastAction: new Date() };
                savePanelData();
                updateStats();
                updateLogs();
                setupUserSearch();
                loadStaffList();
                addLog('Données réinitialisées');
                alert('Données réinitialisées avec succès');
            }
        });
    }

    if (autoRefresh) {
        autoRefresh.addEventListener('change', (e) => {
            if (e.target.checked) {
                setInterval(() => {
                    updateStats();
                    updateLogs();
                }, 30000);
                addLog('Auto-refresh activé');
            }
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadPanelData();
    setupTabButtons();
    setupUserSearch();
    loadStaffList();
    setupSettings();
    updateStats();
    updateLogs();

    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', addStaffEmail);
    }

    const newStaffEmail = document.getElementById('new-staff-email');
    if (newStaffEmail) {
        newStaffEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addStaffEmail();
            }
        });
    }
});
