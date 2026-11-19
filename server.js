const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'backend', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(__dirname));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        cb(null, allowed.includes(file.mimetype));
    }
});

const storeFile = path.join(__dirname, 'roomify_store.json');

const STARTER_DESIGN = {
    id: 101,
    user_id: 1,
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
    created_at: new Date().toISOString(),
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
            { uid: 'obj_init3', sku: 'TVU-CON-01', x: -0.6, y: 0, z: 1.75, rotY: 3.1416, scale: 1, color: '#F8FAFC', material: 'wood' },
            { uid: 'obj_init4', sku: 'CHR-ACC-01', x: 1.35, y: 0, z: -0.2, rotY: -1.0472, scale: 1, color: '#D97757', material: 'fabric' },
            { uid: 'obj_init5', sku: 'DEC-PLT-01', x: -2.15, y: 0, z: -1.75, rotY: 0, scale: 1, color: '#2F855A', material: 'fabric' },
            { uid: 'obj_init6', sku: 'DEC-RUG-02', x: -0.6, y: 0, z: 0.1, rotY: 0, scale: 1, color: '#3B5998', material: 'fabric' }
        ]
    }
};

function readStore() {
    try {
        if (fs.existsSync(storeFile)) {
            return JSON.parse(fs.readFileSync(storeFile, 'utf8'));
        }
    } catch (e) {}
    const initial = { designs: [STARTER_DESIGN], uploads: [] };
    writeStore(initial);
    return initial;
}

function writeStore(data) {
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/backend/api/list_designs.php', (_req, res) => {
    const store = readStore();
    const list = store.designs
        .map(({ design_data, ...meta }) => meta)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    res.json({ success: true, designs: list });
});

app.get('/backend/api/get_design.php', (req, res) => {
    const id = parseInt(req.query.id, 10);
    const store = readStore();
    const found = store.designs.find(d => Number(d.id) === id);
    if (!found) return res.status(404).json({ success: false, message: 'Design not found' });
    res.json({ success: true, design: found });
});

app.post('/backend/api/save_design.php', (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Design name is required' });

    const store = readStore();
    const newId = Date.now();
    const designDataObj = typeof body.design_data === 'string'
        ? JSON.parse(body.design_data)
        : (body.design_data || {});

    const record = {
        id: newId,
        user_id: 1,
        name,
        room_type: body.room_type || 'Living Room',
        theme: body.theme || 'Modern Minimalist',
        room_width: Number(body.room_width) || 5.2,
        room_length: Number(body.room_length) || 4.4,
        wall_height: Number(body.wall_height) || 2.8,
        total_budget: Number(body.total_budget) || 0,
        budget_limit: Number(body.budget_limit) || 200000,
        design_data: designDataObj,
        thumbnail: body.thumbnail || null,
        reference_image: body.reference_image || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    store.designs.unshift(record);
    writeStore(store);
    res.json({ success: true, id: newId, message: 'Design saved' });
});

app.post('/backend/api/update_design.php', (req, res) => {
    const body = req.body || {};
    const id = parseInt(body.id, 10);
    const store = readStore();
    const idx = store.designs.findIndex(d => Number(d.id) === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Design not found' });

    if (body.rename_only) {
        const name = String(body.name || '').trim();
        if (!name) return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        store.designs[idx].name = name;
        store.designs[idx].updated_at = new Date().toISOString();
        writeStore(store);
        return res.json({ success: true, message: 'Design renamed' });
    }

    const designDataObj = typeof body.design_data === 'string'
        ? JSON.parse(body.design_data)
        : (body.design_data || store.designs[idx].design_data);

    store.designs[idx] = {
        ...store.designs[idx],
        name: String(body.name || store.designs[idx].name).trim(),
        room_type: body.room_type || store.designs[idx].room_type,
        theme: body.theme || store.designs[idx].theme,
        room_width: Number(body.room_width) || store.designs[idx].room_width,
        room_length: Number(body.room_length) || store.designs[idx].room_length,
        wall_height: Number(body.wall_height) || store.designs[idx].wall_height,
        total_budget: Number(body.total_budget) ?? store.designs[idx].total_budget,
        budget_limit: Number(body.budget_limit) || store.designs[idx].budget_limit,
        design_data: designDataObj,
        thumbnail: body.thumbnail ?? store.designs[idx].thumbnail,
        reference_image: body.reference_image ?? store.designs[idx].reference_image,
        updated_at: new Date().toISOString()
    };

    writeStore(store);
    res.json({ success: true, message: 'Design updated' });
});

app.post('/backend/api/delete_design.php', (req, res) => {
    const id = parseInt((req.body || {}).id, 10);
    const store = readStore();
    store.designs = store.designs.filter(d => Number(d.id) !== id);
    writeStore(store);
    res.json({ success: true, message: 'Design deleted' });
});

app.post('/backend/api/upload_reference.php', upload.single('reference_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a valid JPG or PNG image' });
    }
    const publicPath = `backend/uploads/${req.file.filename}`;
    const store = readStore();
    store.uploads.push({
        design_id: req.body.design_id ? parseInt(req.body.design_id, 10) : null,
        file_name: req.file.filename,
        file_path: publicPath,
        uploaded_at: new Date().toISOString()
    });
    writeStore(store);
    res.json({ success: true, file_path: publicPath, message: 'Reference photo uploaded' });
});

app.listen(PORT, () => {
    console.log(`ROOMIFY 3D Studio running at http://localhost:${PORT}`);
});
