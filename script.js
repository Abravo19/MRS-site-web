document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG & STATE ---
    const STORAGE_KEY = 'mrs_leagues';
    const IDLE_LIMIT = 10; // Seconds before screensaver
    let idleTimer = 0;

    // Default Data
    const defaultLeagues = [
        { id: 1, name: "Comité Régional Olympique (CROS)", floor: "2", office: "201-205" },
        { id: 2, name: "Ligue Grand Est de Football", floor: "1", office: "110-120" },
        { id: 3, name: "Ligue Régionale de Basketball", floor: "RDC", office: "A04" },
        { id: 4, name: "Comité Régional Handisport", floor: "1", office: "105" },
        { id: 5, name: "Ligue Grand Est de Judo", floor: "RDC", office: "A02" }
    ];

    // --- DOM ELEMENTS ---
    const tableBody = document.getElementById('league-table-body');
    const adminTableBody = document.getElementById('adminTableBody');
    const clockEl = document.getElementById('clock');

    // Admin Modal Elements
    const adminModal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('admin-trigger-btn');
    const closeAdminBtn = document.getElementById('close-modal-btn');
    const loginView = document.getElementById('adminLogin');
    const dashboardView = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logout-btn');
    const adminAddForm = document.getElementById('adminAddForm');

    // Screensaver Elements
    const screensaver = document.getElementById('screensaver');
    const screensaverBg = document.getElementById('screensaver-bg');

    const bgImages = [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop'
    ];
    let currentImageIndex = 0;

    // --- FUNCTIONS: DATA ---

    function getLeagues() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultLeagues;
    }

    function saveLeagues(leagues) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leagues));
        renderTables();
    }

    function renderTables() {
        const leagues = getLeagues();
        // Sort Alphabetically
        leagues.sort((a, b) => a.name.localeCompare(b.name));

        // 1. Render Public Table
        tableBody.innerHTML = '';
        leagues.forEach(l => {
            const floorLabel = l.floor === 'RDC' ? 'Rez-de-chaussée' : `${l.floor}ème Étage`;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${l.name}</td>
                <td style="font-family: var(--font-mono); color: var(--color-gray-500);">${floorLabel}</td>
                <td class="text-right" style="font-family: var(--font-mono);">${l.office}</td>
            `;
            tableBody.appendChild(row);
        });

        // 2. Render Admin Table
        adminTableBody.innerHTML = '';
        leagues.forEach(l => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${l.name}</td>
                <td>${l.floor}</td>
                <td class="text-right">
                    <button class="btn-delete" data-id="${l.id}">Supprimer</button>
                </td>
            `;
            adminTableBody.appendChild(row);
        });

        // Attach Delete Events
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                deleteLeague(id);
            });
        });
    }

    function addLeague(name, floor, office) {
        const leagues = getLeagues();
        leagues.push({
            id: Date.now(),
            name,
            floor,
            office
        });
        saveLeagues(leagues);
    }

    function deleteLeague(id) {
        if (confirm('Confirmer la suppression ?')) {
            const leagues = getLeagues().filter(l => l.id !== id);
            saveLeagues(leagues);
        }
    }

    // --- FUNCTIONS: ADMIN UI ---

    function resetAdminUI() {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        loginError.classList.add('hidden');
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
    }

    adminBtn.addEventListener('click', () => {
        resetAdminUI();
        adminModal.showModal();
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.close();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        if (u === 'admin' && p === 'admin') {
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            renderTables();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', resetAdminUI);

    adminAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inputName').value;
        const floor = document.getElementById('inputFloor').value;
        const office = document.getElementById('inputOffice').value;

        addLeague(name, floor, office);
        e.target.reset();
    });

    // --- FUNCTIONS: SCREENSAVER ---

    function rotateBackground() {
        screensaverBg.style.opacity = 0;
        setTimeout(() => {
            screensaverBg.style.backgroundImage = `url('${bgImages[currentImageIndex]}')`;
            screensaverBg.style.opacity = 0.6;
            currentImageIndex = (currentImageIndex + 1) % bgImages.length;
        }, 500);
    }

    function startScreensaver() {
        if (screensaver.classList.contains('hidden') && !adminModal.open) {
            screensaver.classList.remove('hidden');
            rotateBackground();
        }
    }

    function stopScreensaver() {
        idleTimer = 0;
        if (!screensaver.classList.contains('hidden')) {
            screensaver.classList.add('hidden');
        }
    }

    setInterval(() => {
        idleTimer++;
        if (idleTimer > IDLE_LIMIT) {
            startScreensaver();
        }
        if (!screensaver.classList.contains('hidden')) {
            // Rotate image every 5 seconds while active
            if (idleTimer % 5 === 0) rotateBackground();
        }
    }, 1000);

    // Reset timer on interaction
    ['mousemove', 'click', 'keypress', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, stopScreensaver);
    });

    // --- INITIALIZATION ---

    // Clock
    setInterval(() => {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }, 1000);

    // Initial Data Load
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLeagues));
    }
    renderTables();
});
