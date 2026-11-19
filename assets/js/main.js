const RoomifyUtils = {
    formatINR(amount) {
        const num = Number(amount) || 0;
        return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    },

    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
        el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.25s ease';
            setTimeout(() => el.remove(), 260);
        }, 3200);
    },

    generateId() {
        return 'obj_' + Math.random().toString(36).substring(2, 10);
    }
};

const RoomifyAPI = {
    BASE_URL: 'backend/api',
    STORAGE_KEY: 'roomify_saved_designs_v1',
    backendAvailable: null,

    getLocalDesigns() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        const starter = [this.createDefaultStarterDesign()];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(starter));
        return starter;
    },

    saveLocalDesigns(list) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    },

    createDefaultStarterDesign() {
        return {
            id: 101,
            name: 'Sunlit Studio Living & Lounge',
            room_type: 'Living Room',
            theme: 'Scandinavian',
            room_width: 5.4,
            room_length: 4.6,
            wall_height: 2.8,
            total_budget: 100994,
            budget_limit: 200000,
            thumbnail: null,
            reference_image: null,
            updated_at: new Date().toISOString(),
            design_data: {
                room: {
                    width: 5.4,
                    length: 4.6,
                    height: 2.8,
                    thickness: 0.18,
                    shape: 'rectangle',
                    hasDoor: true,
                    doorOffset: 1.2,
                    hasWindow: true,
                    windowOffset: 0
                },
                walls: {
                    north: { color: '#F3F4F6', finish: 'paint' },
                    south: { color: '#F3F4F6', finish: 'paint' },
                    east: { color: '#F3F4F6', finish: 'paint' },
                    west: { color: '#E8EEF5', finish: 'plaster' }
                },
                floor: { type: 'wood', tint: '#C69C6D' },
                lighting: { mode: 'day', ambient: 0.68, main: 0.92, color: '#FFFDF7', ceilingLight: true },
                items: [
                    { uid: 'obj_init1', sku: 'SOFA-3S-01', x: -0.6, y: 0, z: -0.9, rotY: 0, scale: 1, color: '#5C4B3E', material: 'fabric' },
                    { uid: 'obj_init2', sku: 'TBL-COF-01', x: -0.6, y: 0, z: 0.35, rotY: 0, scale: 1, color: '#F1F5F9', material: 'marble' },
                    { uid: 'obj_init3', sku: 'TVU-CON-01', x: -0.6, y: 0, z: 1.75, rotY: Math.PI, scale: 1, color: '#F8FAFC', material: 'wood' },
                    { uid: 'obj_init4', sku: 'CHR-ACC-01', x: 1.35, y: 0, z: -0.2, rotY: -Math.PI / 3, scale: 1, color: '#D97757', material: 'fabric' },
                    { uid: 'obj_init5', sku: 'DEC-PLT-01', x: -2.15, y: 0, z: -1.75, rotY: 0, scale: 1, color: '#2F855A', material: 'fabric' },
                    { uid: 'obj_init6', sku: 'DEC-RUG-02', x: -0.6, y: 0, z: 0.1, rotY: 0, scale: 1, color: '#3B5998', material: 'fabric' }
                ]
            }
        };
    },

    async listDesigns() {
        try {
            const res = await fetch(`${this.BASE_URL}/list_designs.php`);
            if (!res.ok) throw new Error('Server unreachable');
            const data = await res.json();
            if (data.success) {
                this.backendAvailable = true;
                return { designs: data.designs, source: 'server' };
            }
        } catch (err) {
            this.backendAvailable = false;
        }
        return { designs: this.getLocalDesigns(), source: 'local' };
    },

    async getDesign(id) {
        try {
            const res = await fetch(`${this.BASE_URL}/get_design.php?id=${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error('Server unreachable');
            const data = await res.json();
            if (data.success) {
                this.backendAvailable = true;
                return data.design;
            }
        } catch (err) {
            this.backendAvailable = false;
        }
        const list = this.getLocalDesigns();
        return list.find(d => String(d.id) === String(id)) || list[0];
    },

    async saveNewDesign(payload) {
        try {
            const res = await fetch(`${this.BASE_URL}/save_design.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Server unreachable');
            const data = await res.json();
            if (data.success) {
                this.backendAvailable = true;
                return { id: data.id, source: 'server' };
            }
        } catch (err) {
            this.backendAvailable = false;
        }
        const list = this.getLocalDesigns();
        const newId = Date.now();
        const record = {
            ...payload,
            id: newId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        list.unshift(record);
        this.saveLocalDesigns(list);
        return { id: newId, source: 'local' };
    },

    async updateDesign(payload) {
        try {
            const res = await fetch(`${this.BASE_URL}/update_design.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Server unreachable');
            const data = await res.json();
            if (data.success) {
                this.backendAvailable = true;
                return { success: true, source: 'server' };
            }
        } catch (err) {
            this.backendAvailable = false;
        }
        const list = this.getLocalDesigns();
        const idx = list.findIndex(d => String(d.id) === String(payload.id));
        if (idx !== -1) {
            if (payload.rename_only) {
                list[idx].name = payload.name;
            } else {
                list[idx] = { ...list[idx], ...payload, updated_at: new Date().toISOString() };
            }
            this.saveLocalDesigns(list);
        }
        return { success: true, source: 'local' };
    },

    async deleteDesign(id) {
        try {
            const res = await fetch(`${this.BASE_URL}/delete_design.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (!res.ok) throw new Error('Server unreachable');
            const data = await res.json();
            if (data.success) return true;
        } catch (err) {}
        const list = this.getLocalDesigns().filter(d => String(d.id) !== String(id));
        this.saveLocalDesigns(list);
        return true;
    }
};
