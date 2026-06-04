// Espace Utilisateur - Sanctions Roblox
// DCP sanctions are fetched live from Roblox DataStore via proxy
 
// ⚠️ CONFIGURE ICI le chemin vers ton proxy PHP
const SANCTIONS_PROXY_URL = 'https://sanctionsproxy.onrender.com/api/sanctions';
 
let userData = {
    email: localStorage.getItem('userEmail') || '',
    robloxHandle: localStorage.getItem('robloxHandle') || '',
    robloxUserId: localStorage.getItem('robloxUserId') || '',
};
 
// ── Persistance ───────────────────────────────────────────────────────────────
 
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
    userData.email         = localStorage.getItem('userEmail')    || userData.email;
    userData.robloxHandle  = localStorage.getItem('robloxHandle') || userData.robloxHandle;
    userData.robloxUserId  = localStorage.getItem('robloxUserId') || userData.robloxUserId;
};
 
const saveUserData = () => {
    localStorage.setItem('userData',      JSON.stringify(userData));
    localStorage.setItem('robloxHandle',  userData.robloxHandle);
    localStorage.setItem('robloxUserId',  userData.robloxUserId);
};
 
// ── Auth ──────────────────────────────────────────────────────────────────────
 
const requireLogin = () => {
    if (!userData.email) window.location.href = 'login.html';
};
 
// ── Validation ────────────────────────────────────────────────────────────────
 
const validateRobloxHandle = (handle) => {
    // Accepte "@pseudo" ou "pseudo" (sans @)
    return /^@?[A-Za-z0-9_]{3,20}$/.test(handle.trim());
};
 
// ── Labels ────────────────────────────────────────────────────────────────────
 
const getSanctionLabel = (type) => {
    const labels = {
        warning:            '⚠️ Avertissement',
        ban_7d:             '🚫 Ban 7 jours',
        ban_30d:            '🚫 Ban 30 jours',
        ban_permanent:      '🔒 Ban Permanent',
        ban:                '🚫 Ban',
        mute:               '🔇 Mute Chat',
        kick:               '👢 Kick',
        account_restricted: '⛔ Compte restreint'
    };
    return labels[(type || '').toLowerCase()] || type;
};
 
const formatSanctionDuration = (sanction) => {
    if (sanction.permanent) return 'Permanent';
    if (sanction.expiresAt && typeof sanction.expiresAt === 'number') {
        const d = new Date(sanction.expiresAt * 1000);
        return `Expire le ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (sanction.expiresAt) return `Expire le ${sanction.expiresAt}`;
    return sanction.duration || 'Permanent';
};
 
// ── Roblox API : résoudre pseudo → UserID ─────────────────────────────────────
 
const resolveRobloxUserId = async (handle) => {
    // Enlève le @ si présent
    const username = handle.replace(/^@/, '');
    try {
        const res = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        });
        const data = await res.json();
        if (data?.data?.[0]?.id) return String(data.data[0].id);
        return null;
    } catch {
        return null;
    }
};
 
// ── Fetch sanctions DCP depuis le proxy ───────────────────────────────────────
 
const fetchDCPSanctions = async (userId) => {
    const res  = await fetch(`${SANCTIONS_PROXY_URL}?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data; // { name, sanctions: [...] }
};
 
// ── Rendu : header joueur ─────────────────────────────────────────────────────
 
const renderUserHeader = () => {
    const userWelcome = document.getElementById('user-welcome');
    if (!userWelcome) return;
 
    const robloxLabel = userData.robloxHandle || 'Pseudo Roblox non défini';
    userWelcome.innerHTML = `
        <div class="user-card">
            <h3>Bonjour ${userData.email}</h3>
            <p><strong>Pseudo Roblox :</strong> ${robloxLabel}</p>
            <p>Votre pseudo Roblox est utilisé pour lier votre espace utilisateur aux sanctions du jeu.</p>
            ${userData.robloxHandle ? `<button class="btn btn-sm btn-outline" id="change-handle-btn">Changer de pseudo</button>` : ''}
        </div>
    `;
 
    document.getElementById('change-handle-btn')?.addEventListener('click', () => {
        userData.robloxHandle = '';
        userData.robloxUserId = '';
        saveUserData();
        renderUserHeader();
        renderRobloxHandleForm();
        renderSanctions();
    });
};
 
// ── Rendu : formulaire pseudo ─────────────────────────────────────────────────
 
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
                <button class="btn" type="submit" id="handle-submit-btn">Valider</button>
            </form>
            <p id="handle-form-error" class="form-error" style="display:none;color:red;margin-top:8px;"></p>
            <p class="form-note">Ce pseudo est utile pour synchroniser vos sanctions entre le site et le jeu.</p>
        </div>
    `;
 
    document.getElementById('roblox-handle-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input     = document.getElementById('roblox-handle-input');
        const btn       = document.getElementById('handle-submit-btn');
        const errorEl   = document.getElementById('handle-form-error');
        const handle    = input.value.trim();
 
        if (!validateRobloxHandle(handle)) {
            errorEl.textContent = 'Pseudo invalide. Exemple valide : @MonPseudo';
            errorEl.style.display = 'block';
            return;
        }
 
        // Résolution du UserID
        btn.disabled     = true;
        btn.textContent  = 'Recherche...';
        errorEl.style.display = 'none';
 
        const userId = await resolveRobloxUserId(handle);
 
        if (!userId) {
            btn.disabled    = false;
            btn.textContent = 'Valider';
            errorEl.textContent = 'Pseudo Roblox introuvable. Vérifie l\'orthographe.';
            errorEl.style.display = 'block';
            return;
        }
 
        userData.robloxHandle = handle.startsWith('@') ? handle : '@' + handle;
        userData.robloxUserId = userId;
        saveUserData();
        renderUserHeader();
        renderRobloxHandleForm();
        renderSanctions();
    });
};
 
// ── Rendu : sanctions ─────────────────────────────────────────────────────────
 
const renderSanctions = async () => {
    const container = document.getElementById('sanctions-container');
    if (!container) return;
 
    // Pas de pseudo lié = on attend
    if (!userData.robloxHandle || !userData.robloxUserId) {
        container.innerHTML = `<p class="form-note">Entrez votre pseudo Roblox pour voir vos sanctions.</p>`;
        return;
    }
 
    // Loading
    container.innerHTML = `
        <div class="sanctions-summary">
            <div class="summary-card">
                <h3>Vos sanctions D.C.P</h3>
                <p>Chargement en cours...</p>
            </div>
        </div>`;
 
    let dcpSanctions = [];
    let fetchError   = null;
 
    try {
        const data   = await fetchDCPSanctions(userData.robloxUserId);
        dcpSanctions = data.sanctions || [];
    } catch (err) {
        fetchError = err.message || 'Erreur inconnue';
    }
 
    if (fetchError) {
        container.innerHTML = `
            <div class="sanctions-summary">
                <div class="summary-card">
                    <h3>Vos sanctions D.C.P</h3>
                    <p style="color:red;">⚠️ Impossible de charger les sanctions : ${fetchError}</p>
                </div>
            </div>`;
        return;
    }
 
    const totalBans  = dcpSanctions.filter(s => (s.type || '').toLowerCase().includes('ban')).length;
    const totalWarns = dcpSanctions.filter(s => (s.type || '').toLowerCase().includes('warn')).length;
    const totalMutes = dcpSanctions.filter(s => (s.type || '').toLowerCase().includes('mute')).length;
 
    // Trie par date décroissante
    const sorted = [...dcpSanctions].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
 
    container.innerHTML = `
        <div class="sanctions-summary">
            <div class="summary-card">
                <h3>Vos sanctions D.C.P</h3>
                <p><strong>Total bans :</strong> ${totalBans}</p>
                <p><strong>Total avertissements :</strong> ${totalWarns}</p>
                <p><strong>Total mutes :</strong> ${totalMutes}</p>
            </div>
        </div>
        ${sorted.length === 0
            ? '<p class="clean-record">✅ Aucune sanction enregistrée sur D.C.P.</p>'
            : `<div class="sanctions-list">
                ${sorted.map(s => `
                    <div class="sanction-item sanction-${(s.type || 'unknown').toLowerCase()}">
                        <div class="sanction-header">
                            <span class="sanction-type">${getSanctionLabel(s.type)}</span>
                            <span class="sanction-game">D.C.P</span>
                            <span class="sanction-date">${s.date || '—'}</span>
                        </div>
                        <p class="sanction-reason"><strong>Raison :</strong> ${s.reason || 'Non spécifiée'}</p>
                        <p class="sanction-duration"><strong>Durée :</strong> ${formatSanctionDuration(s)}</p>
                        <p class="sanction-staff"><strong>Sanctionné par :</strong> ${s.staff || '—'}</p>
                    </div>
                `).join('')}
               </div>`
        }
    `;
};
 
// ── Logout ────────────────────────────────────────────────────────────────────
 
const setupLogoutLink = () => {
    const logoutLink = document.querySelector('.login-nav-btn');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('robloxHandle');
            localStorage.removeItem('robloxUserId');
            localStorage.removeItem('userData');
        });
    }
};
 
// ── Init ──────────────────────────────────────────────────────────────────────
 
const initUserSpace = () => {
    loadUserData();
    requireLogin();
    renderUserHeader();
    renderRobloxHandleForm();
    renderSanctions();
    setupLogoutLink();
};
 
document.addEventListener('DOMContentLoaded', initUserSpace);