// Panel Staff Functionalities
let panelData = {
    users: [],
    logs: [],
    connections: 0,
    lastAction: new Date()
};

// Load data from localStorage
const loadPanelData = () => {
    const stored = localStorage.getItem('panelData');
    if (stored) {
        panelData = JSON.parse(stored);
    }
};

// Save data to localStorage
const savePanelData = () => {
    localStorage.setItem('panelData', JSON.stringify(panelData));
};

// Add log entry
const addLog = (action, details = '') => {
    const now = new Date();
    panelData.logs.unshift({
        timestamp: now.toLocaleTimeString('fr-FR'),
        action: action,
        details: details
    });
    if (panelData.logs.length > 100) {
        panelData.logs.pop();
    }
    panelData.lastAction = now;
    savePanelData();
    updateLogs();
    updateStats();
};

// Update stats display
const updateStats = () => {
    const statsConnections = document.getElementById('stats-connections');
    const statsActive = document.getElementById('stats-active');
    const statsStaff = document.getElementById('stats-staff');
    const statsLast = document.getElementById('stats-last');

    if (statsConnections) statsConnections.textContent = panelData.connections;
    if (statsActive) statsActive.textContent = panelData.users.length;
    if (statsStaff) {
        fetch('staff-emails.json')
            .then(r => r.json())
            .then(data => {
                if (statsStaff) statsStaff.textContent = data.length;
            })
            .catch(() => {
                if (statsStaff) statsStaff.textContent = '?';
            });
    }
    if (statsLast) statsLast.textContent = panelData.lastAction.toLocaleTimeString('fr-FR');
};

// Update logs display
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
            <span class="log-action">${log.action}</span>
            ${log.details ? `<span class="log-details">${log.details}</span>` : ''}
        </div>
    `).join('');
};

// Tab switching
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
        });
    });
};

// Staff emails management
const loadStaffList = async () => {
    try {
        const response = await fetch('staff-emails.json');
        const emails = await response.json();
        const staffList = document.getElementById('staff-list');

        if (!staffList) return;

        staffList.innerHTML = emails.map((email, idx) => `
            <div class="staff-item">
                <span>${email}</span>
                <button class="btn-small" data-index="${idx}">Supprimer</button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-small').forEach(btn => {
            btn.addEventListener('click', () => {
                removeStaffEmail(parseInt(btn.dataset.index));
            });
        });
    } catch (error) {
        console.error('Erreur chargement staff emails:', error);
    }
};

const addStaffEmail = () => {
    const input = document.getElementById('new-staff-email');
    if (!input || !input.value.trim()) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    const email = input.value.trim().toLowerCase();
    addLog('Email staff ajouté', email);
    input.value = '';

    loadStaffList();
};

const removeStaffEmail = (index) => {
    addLog('Email staff supprimé');
    loadStaffList();
};

// Settings
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
            a.download = `panel-data-${new Date().toISOString()}.json`;
            a.click();
            addLog('Données exportées');
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser les données ?')) {
                panelData = { users: [], logs: [], connections: 0, lastAction: new Date() };
                savePanelData();
                updateStats();
                updateLogs();
                addLog('Données réinitialisées');
            }
        });
    }

    if (autoRefresh) {
        autoRefresh.addEventListener('change', (e) => {
            if (e.target.checked) {
                setInterval(updateStats, 30000);
                addLog('Auto-refresh activé');
            }
        });
    }
};

// Initialize panel
document.addEventListener('DOMContentLoaded', () => {
    loadPanelData();
    setupTabButtons();
    loadStaffList();
    setupSettings();
    updateStats();
    updateLogs();

    const addStaffBtn = document.getElementById('add-staff-btn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', addStaffEmail);
    }

    // Simulate some connections
    panelData.connections = Math.floor(Math.random() * 100) + 50;
    savePanelData();
    updateStats();
});
