document.addEventListener('DOMContentLoaded', () => {
    let allDesigns = [];
    let activeRoomFilter = 'all';
    let searchQuery = '';

    const recentGrid = document.getElementById('recentDesignsGrid');
    const allGrid = document.getElementById('allDesignsGrid');
    const storageBadge = document.getElementById('storageModeBadge');

    async function loadDashboard() {
        const { designs, source } = await RoomifyAPI.listDesigns();
        allDesigns = designs;
        storageBadge.textContent = source === 'server' ? 'Connected: Cloud Studio DB' : 'Local Browser Storage Mode';
        updateKPIs();
        renderGrids();
    }

    function updateKPIs() {
        document.getElementById('kpiTotalDesigns').textContent = allDesigns.length;
        const sum = allDesigns.reduce((acc, d) => acc + (Number(d.total_budget) || 0), 0);
        document.getElementById('kpiTotalValue').textContent = RoomifyUtils.formatINR(sum);
    }

    function createDesignCardHTML(design) {
        const modified = new Date(design.updated_at || Date.now()).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const thumbHTML = design.thumbnail
            ? `<img src="${design.thumbnail}" alt="${design.name}">`
            : `<div class="thumb-placeholder"><i class="fa-solid fa-cube"></i><div>${design.room_width}m × ${design.room_length}m</div></div>`;

        return `
            <article class="design-card">
                <div class="design-thumb" onclick="window.location.href='editor.html?id=${design.id}'">
                    ${thumbHTML}
                    <span class="room-badge-tag">${design.room_type} • ${design.theme}</span>
                    <span class="budget-badge-tag">${RoomifyUtils.formatINR(design.total_budget)}</span>
                </div>
                <div class="design-card-body">
                    <div>
                        <h3>${design.name}</h3>
                        <div class="design-meta-line">Last edited: ${modified} • ${design.room_width}m × ${design.room_length}m</div>
                    </div>
                    <div class="design-card-actions">
                        <a href="editor.html?id=${design.id}" class="btn btn-primary btn-sm">
                            <i class="fa-solid fa-pen-to-square"></i> Open
                        </a>
                        <div class="icon-action-group">
                            <button class="icon-btn-sm" data-action="rename" data-id="${design.id}" title="Rename"><i class="fa-solid fa-i-cursor"></i></button>
                            <button class="icon-btn-sm" data-action="duplicate" data-id="${design.id}" title="Duplicate"><i class="fa-regular fa-copy"></i></button>
                            <button class="icon-btn-sm del" data-action="delete" data-id="${design.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderGrids() {
        const recent = allDesigns.slice(0, 3);
        recentGrid.innerHTML = recent.length
            ? recent.map(createDesignCardHTML).join('')
            : '<p>No recent designs found. Click "Create New Design" to start!</p>';

        const filtered = allDesigns.filter(d => {
            const matchesCat = activeRoomFilter === 'all' || d.room_type === activeRoomFilter;
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.theme.toLowerCase().includes(q) || d.room_type.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });

        allGrid.innerHTML = filtered.length
            ? filtered.map(createDesignCardHTML).join('')
            : '<p>No matching room designs found.</p>';
    }

    const openModal = id => document.getElementById(id).classList.remove('hidden');
    const closeModal = id => document.getElementById(id).classList.add('hidden');

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    document.getElementById('openNewDesignModalBtn').addEventListener('click', () => openModal('newDesignModal'));
    document.getElementById('profileSettingsBtn').addEventListener('click', () => openModal('profileModal'));

    document.getElementById('saveProfilePrefsBtn').addEventListener('click', () => {
        const newName = document.getElementById('prefUserName').value.trim() || 'Studio Designer';
        document.querySelector('.u-name').textContent = newName;
        closeModal('profileModal');
        RoomifyUtils.toast('Studio preferences updated.', 'success');
    });

    document.getElementById('newDesignForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const width = parseFloat(document.getElementById('newRoomWidth').value) || 5.2;
        const length = parseFloat(document.getElementById('newRoomLength').value) || 4.4;
        const height = parseFloat(document.getElementById('newWallHeight').value) || 2.8;
        const theme = document.getElementById('newRoomTheme').value;
        const roomType = document.getElementById('newRoomType').value;

        const payload = {
            name: document.getElementById('newDesignName').value.trim(),
            room_type: roomType,
            theme: theme,
            room_width: width,
            room_length: length,
            wall_height: height,
            total_budget: 0,
            budget_limit: parseFloat(document.getElementById('newBudgetLimit').value) || 200000,
            design_data: {
                room: { width, length, height, thickness: 0.18, shape: 'rectangle', hasDoor: true, doorOffset: 1.0, hasWindow: true, windowOffset: 0 },
                walls: {
                    north: { color: '#F3F4F6', finish: 'paint' },
                    south: { color: '#F3F4F6', finish: 'paint' },
                    east: { color: '#F3F4F6', finish: 'paint' },
                    west: { color: '#F3F4F6', finish: 'paint' }
                },
                floor: { type: 'wood', tint: '#C69C6D' },
                lighting: { mode: 'day', ambient: 0.65, main: 0.90, color: '#FFFDF7', ceilingLight: true },
                items: []
            }
        };

        const res = await RoomifyAPI.saveNewDesign(payload);
        window.location.href = `editor.html?id=${res.id}`;
    });

    document.body.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const targetDesign = allDesigns.find(d => String(d.id) === String(id));
        if (!targetDesign) return;

        if (action === 'rename') {
            document.getElementById('renameDesignId').value = id;
            document.getElementById('renameInput').value = targetDesign.name;
            openModal('renameModal');
        } else if (action === 'duplicate') {
            const full = await RoomifyAPI.getDesign(id);
            await RoomifyAPI.saveNewDesign({
                ...full,
                name: `${full.name} (Copy)`
            });
            RoomifyUtils.toast('Design duplicated.', 'success');
            loadDashboard();
        } else if (action === 'delete') {
            document.getElementById('deleteDesignId').value = id;
            document.getElementById('deleteDesignTitle').textContent = targetDesign.name;
            openModal('deleteModal');
        }
    });

    document.getElementById('renameForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('renameDesignId').value;
        const name = document.getElementById('renameInput').value.trim();
        if (!name) return;
        await RoomifyAPI.updateDesign({ id, name, rename_only: true });
        closeModal('renameModal');
        RoomifyUtils.toast('Design renamed.', 'success');
        loadDashboard();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        const id = document.getElementById('deleteDesignId').value;
        await RoomifyAPI.deleteDesign(id);
        closeModal('deleteModal');
        RoomifyUtils.toast('Design deleted.', 'info');
        loadDashboard();
    });

    document.getElementById('dashSearchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderGrids();
    });

    document.querySelectorAll('[data-room-filter]').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('[data-room-filter]').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeRoomFilter = pill.dataset.roomFilter;
            renderGrids();
        });
    });

    loadDashboard();
});
