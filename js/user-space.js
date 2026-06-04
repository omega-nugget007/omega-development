// Espace Utilisateur - Sanctions Roblox

let userData = {
    email: localStorage.getItem('userEmail') || '',
    robloxHandle: localStorage.getItem('robloxHandle') || '',
    games: [
        {
            id: 1,
            name: 'Nantes RP',
            sanctions: [
                { id: 1, type: 'warning', reason: 'Spam dans le chat', date: '01/06/2026', duration: 'permanent' },
                { id: 2, type: 'ban_7d', reason: 'Comportement toxique', date: '02/06/2026', expiresAt: '09/06/2026' }
            ]
        },
        {
            id: 2,
            name: 'D.C.P',
            sanctions: [
                { id: 3, type: 'warning', reason: 'Utilisation de glitch', date: '15/05/2026', duration: 'permanent' }
            ]
        },
        {
            id: 3,
            name: 'Prison Life',
            sanctions: []
        }
    ]
};

const loadUserData = () => {
    const stored = localStorage.getItem('userData');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            userData = { ...userData, ...parsed };
        } catch (error) {
            console.warn('Impossible de lire userData en localStorage :', error);
        }
    }
    userData.email = localStorage.getItem('userEmail') || userData.email;
    userData.robloxHandle = localStorage.getItem('robloxHandle') || userData.robloxHandle;
};

const saveUserData = () => {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('robloxHandle', userData.robloxHandle);
};

const requireLogin = () => {
    if (!userData.email) {
        window.location.href = 'login.html';
    }
};

const validateRobloxHandle = (handle) => {
    return /^@[A-Za-z0-9_]{3,20}$/.test(handle.trim());
};

const formatSanctionDuration = (sanction) => {
    if (sanction.expiresAt) {
        return `Expire le ${sanction.expiresAt}`;
    }
    return sanction.duration || 'Permanent';
};

const getSanctionLabel = (type) => {
    const labels = {
        warning: '⚠️ Avertissement',
        ban_7d: '🚫 Ban 7 jours',
        ban_30d: '🚫 Ban 30 jours',
        ban_permanent: '🔒 Ban Permanent',
        mute: '🔇 Mute Chat',
        account_restricted: '⛔ Compte restreint'
    };
    return labels[type] || type;
};

const renderUserHeader = () => {
    const userWelcome = document.getElementById('user-welcome');
    if (!userWelcome) return;

    const robloxLabel = userData.robloxHandle ? userData.robloxHandle : 'Pseudo Roblox non défini';
    userWelcome.innerHTML = `
        <div class="user-card">
            <h3>Bonjour ${userData.email}</h3>
            <p><strong>Pseudo Roblox :</strong> ${robloxLabel}</p>
            <p>Votre pseudo Roblox est utilisé pour lier votre espace utilisateur aux sanctions du jeu.</p>
        </div>
    `;
};

const renderRobloxHandleForm = () => {
    const formContainer = document.getElementById('roblox-handle-form');
    if (!formContainer) return;

    if (userData.robloxHandle) {
        formContainer.innerHTML = '';
        return;
    }

    formContainer.innerHTML = `
        <div class="roblox-handle-card">
            <h3>Entrez votre pseudo Roblox</h3>
            <p>Votre pseudo doit commencer par <strong>@</strong> et sera stocké pour la liaison avec le jeu.</p>
            <form id="roblox-handle-form-element" class="roblox-handle-form">
                <input type="text" id="roblox-handle-input" placeholder="@PseudoRoblox" required />
                <button class="btn" type="submit">Valider</button>
            </form>
            <p class="form-note">Ce pseudo est utile pour synchroniser vos sanctions entre le site et le jeu.</p>
        </div>
    `;

    const form = document.getElementById('roblox-handle-form-element');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('roblox-handle-input');
        if (!input) return;

        const handle = input.value.trim();
        if (!validateRobloxHandle(handle)) {
            alert('Veuillez entrer un pseudo Roblox valide commençant par @ et sans espaces.');
            return;
        }

        userData.robloxHandle = handle;
        saveUserData();
        renderUserHeader();
        renderRobloxHandleForm();
        renderSanctions();
    });
};

const getAllSanctions = () => {
    const sanctions = [];
    userData.games.forEach((game) => {
        game.sanctions.forEach((sanction) => {
            sanctions.push({ ...sanction, gameName: game.name });
        });
    });
    return sanctions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const renderSanctions = () => {
    const container = document.getElementById('sanctions-container');
    if (!container) return;

    const sanctions = getAllSanctions();
    const totalWarnings = sanctions.filter((s) => s.type === 'warning').length;
    const totalBans = sanctions.filter((s) => s.type.includes('ban')).length;

    container.innerHTML = `
        <div class="sanctions-summary">
            <div class="summary-card">
                <h3>Vos sanctions</h3>
                <p><strong>Total avertissements :</strong> ${totalWarnings}</p>
                <p><strong>Total bans :</strong> ${totalBans}</p>
            </div>
        </div>
        ${sanctions.length === 0 ? '<p class="clean-record">✅ Aucune sanction enregistrée pour le moment.</p>' : `
            <div class="sanctions-list">
                ${sanctions.map((sanction) => `
                    <div class="sanction-item sanction-${sanction.type}">
                        <div class="sanction-header">
                            <span class="sanction-type">${getSanctionLabel(sanction.type)}</span>
                            <span class="sanction-game">${sanction.gameName}</span>
                            <span class="sanction-date">${sanction.date}</span>
                        </div>
                        <p class="sanction-reason"><strong>Raison :</strong> ${sanction.reason}</p>
                        <p class="sanction-duration"><strong>Durée :</strong> ${formatSanctionDuration(sanction)}</p>
                    </div>
                `).join('')}
            </div>
        `}
    `;
};

const setupLogoutLink = () => {
    const logoutLink = document.querySelector('.login-nav-btn');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('robloxHandle');
        });
    }
};

const initUserSpace = () => {
    loadUserData();
    requireLogin();
    renderUserHeader();
    renderRobloxHandleForm();
    renderSanctions();
    setupLogoutLink();
};

document.addEventListener('DOMContentLoaded', initUserSpace);

