const RoomifyFurniture = {
    CATALOG: [
        { sku: 'BED-KING-01', category: 'beds', categoryLabel: 'Beds', name: 'Nordic King Platform Bed', type: 'bed', width: 2.00, height: 1.05, depth: 2.15, price: 38999, color: '#C8B6A6', material: 'fabric', icon: 'fa-bed', colors: ['#C8B6A6','#4A5568','#EAE0D5','#3D352E'] },
        { sku: 'BED-QUN-02', category: 'beds', categoryLabel: 'Beds', name: 'Teakwood Queen Bed', type: 'bed', width: 1.65, height: 1.00, depth: 2.05, price: 29499, color: '#6F4E37', material: 'wood', icon: 'fa-bed', colors: ['#6F4E37','#8D6E63','#3E2723','#D7CCC8'] },
        { sku: 'SOFA-3S-01', category: 'sofas', categoryLabel: 'Sofas', name: 'Milano 3-Seater Sofa', type: 'sofa', width: 2.10, height: 0.88, depth: 0.94, price: 44999, color: '#5C4B3E', material: 'fabric', icon: 'fa-couch', colors: ['#5C4B3E','#2D3748','#CBD5E0','#1E40AF','#9B2C2C'] },
        { sku: 'SOFA-LSH-02', category: 'sofas', categoryLabel: 'Sofas', name: 'Oslo Lounge Loveseat', type: 'sofa', width: 1.55, height: 0.85, depth: 0.88, price: 28500, color: '#64748B', material: 'fabric', icon: 'fa-couch', colors: ['#64748B','#D6C7B2','#334155','#0F766E'] },
        { sku: 'CHR-ACC-01', category: 'chairs', categoryLabel: 'Chairs', name: 'Scandi Lounge Accent Chair', type: 'chair', width: 0.76, height: 0.82, depth: 0.78, price: 12499, color: '#D97757', material: 'fabric', icon: 'fa-chair', colors: ['#D97757','#2B6CB0','#4A5568','#E2E8F0'] },
        { sku: 'CHR-OFF-02', category: 'chairs', categoryLabel: 'Chairs', name: 'Ergo Study Task Chair', type: 'chair', width: 0.62, height: 0.95, depth: 0.62, price: 9499, color: '#1E293B', material: 'leather', icon: 'fa-chair', colors: ['#1E293B','#475569','#94A3B8'] },
        { sku: 'TBL-COF-01', category: 'tables', categoryLabel: 'Tables', name: 'Marble Top Coffee Table', type: 'table', width: 1.15, height: 0.42, depth: 0.65, price: 11999, color: '#F1F5F9', material: 'marble', icon: 'fa-table', colors: ['#F1F5F9','#334155','#8B5A2B','#1E293B'] },
        { sku: 'TBL-SID-02', category: 'tables', categoryLabel: 'Tables', name: 'Oak Bedside Nightstand', type: 'table', width: 0.50, height: 0.55, depth: 0.44, price: 5499, color: '#A47551', material: 'wood', icon: 'fa-table', colors: ['#A47551','#F8FAFC','#3E2723'] },
        { sku: 'WRD-3DR-01', category: 'wardrobes', categoryLabel: 'Wardrobes', name: 'Ivory 3-Door Wardrobe', type: 'wardrobe', width: 1.60, height: 2.10, depth: 0.60, price: 36999, color: '#F5F2EB', material: 'wood', icon: 'fa-door-closed', colors: ['#F5F2EB','#8D6E63','#334155','#CBD5E1'] },
        { sku: 'CAB-KCH-01', category: 'cabinets', categoryLabel: 'Cabinets', name: 'Sage Modular Kitchen Counter', type: 'cabinet', width: 1.80, height: 0.90, depth: 0.65, price: 32500, color: '#5E9C76', material: 'wood', icon: 'fa-box-archive', colors: ['#5E9C76','#F8FAFC','#334155','#92400E'] },
        { sku: 'DSK-STD-01', category: 'desks', categoryLabel: 'Desks', name: 'Minimalist Work & Study Desk', type: 'desk', width: 1.40, height: 0.76, depth: 0.70, price: 14999, color: '#9C6F44', material: 'wood', icon: 'fa-desktop', colors: ['#9C6F44','#F8FAFC','#1E293B'] },
        { sku: 'BSH-TLL-01', category: 'bookshelves', categoryLabel: 'Bookshelves', name: '5-Tier Open Bookshelf', type: 'bookshelf', width: 0.90, height: 1.85, depth: 0.36, price: 13499, color: '#7C583A', material: 'wood', icon: 'fa-book', colors: ['#7C583A','#1E293B','#F1F5F9'] },
        { sku: 'TVU-CON-01', category: 'tv_units', categoryLabel: 'TV Units', name: 'Floating Media Console & TV', type: 'tv_unit', width: 1.75, height: 1.15, depth: 0.45, price: 19999, color: '#F8FAFC', material: 'wood', icon: 'fa-tv', colors: ['#F8FAFC','#5C4033','#1E293B'] },
        { sku: 'DIN-6ST-01', category: 'dining_tables', categoryLabel: 'Dining Tables', name: '6-Seater Teak Dining Set', type: 'dining_table', width: 1.80, height: 0.78, depth: 0.95, price: 39500, color: '#7B5233', material: 'wood', icon: 'fa-utensils', colors: ['#7B5233','#F1F5F9','#3E2723'] },
        { sku: 'LMP-FLR-01', category: 'lamps', categoryLabel: 'Lamps', name: 'Arc Brass Floor Lamp', type: 'floor_lamp', width: 0.45, height: 1.65, depth: 0.45, price: 6499, color: '#D4AF37', material: 'metal', icon: 'fa-lightbulb', colors: ['#D4AF37','#1E293B','#F8FAFC'] },
        { sku: 'LMP-TBL-02', category: 'lamps', categoryLabel: 'Lamps', name: 'Ceramic Warm Table Lamp', type: 'table_lamp', width: 0.32, height: 0.52, depth: 0.32, price: 2999, color: '#E2E8F0', material: 'fabric', icon: 'fa-lightbulb', colors: ['#E2E8F0','#FDE68A','#94A3B8'] },
        { sku: 'CRT-WIN-01', category: 'curtains', categoryLabel: 'Curtains', name: 'Linen Floor-Length Curtains', type: 'curtain', width: 1.60, height: 2.35, depth: 0.14, price: 4999, color: '#4A3B47', material: 'fabric', icon: 'fa-columns', colors: ['#4A3B47','#E2E8F0','#1E3A8A','#B45309'] },
        { sku: 'DEC-PLT-01', category: 'decor', categoryLabel: 'Decorative Items', name: 'Monstera Indoor Planter', type: 'plant', width: 0.55, height: 1.15, depth: 0.55, price: 2499, color: '#2F855A', material: 'fabric', icon: 'fa-seedling', colors: ['#2F855A','#276749','#48BB78'] },
        { sku: 'DEC-RUG-02', category: 'decor', categoryLabel: 'Decorative Items', name: 'Jaipur Handwoven Area Rug', type: 'rug', width: 2.40, height: 0.03, depth: 1.60, price: 8999, color: '#3B5998', material: 'fabric', icon: 'fa-rug', colors: ['#3B5998','#9B2C2C','#D69E2E','#CBD5E0'] },
        { sku: 'DEC-ART-03', category: 'decor', categoryLabel: 'Decorative Items', name: 'Abstract Framed Wall Canvas', type: 'painting', width: 1.10, height: 0.80, depth: 0.06, price: 3999, color: '#2563EB', material: 'wood', icon: 'fa-image', colors: ['#2563EB','#D97706','#10B981','#1E293B'] },
        { sku: 'DEC-MIR-04', category: 'decor', categoryLabel: 'Decorative Items', name: 'Full-Length Arch Wall Mirror', type: 'mirror', width: 0.70, height: 1.65, depth: 0.06, price: 6999, color: '#CBD5E1', material: 'glass', icon: 'fa-clone', colors: ['#CBD5E1','#D4AF37','#1E293B'] }
    ],

    getBySku(sku) {
        return this.CATALOG.find(item => item.sku === sku) || this.CATALOG[0];
    },

    buildMesh(itemData, state = {}) {
        const group = new THREE.Group();
        const color = state.color || itemData.color;
        const materialType = state.material || itemData.material;
        const primaryMat = RoomifyMaterials.buildFurnitureMaterial(materialType, color);
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.5 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.7 });

        const w = itemData.width;
        const h = itemData.height;
        const d = itemData.depth;

        const addBox = (bw, bh, bd, mat, x = 0, y = 0, z = 0) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            return mesh;
        };

        switch (itemData.type) {
            case 'bed': {
                addBox(w, h * 0.30, d, primaryMat, 0, h * 0.15, 0);
                addBox(w * 0.94, h * 0.22, d * 0.92, whiteMat, 0, h * 0.38, 0.04);
                addBox(w, h * 0.95, 0.12, primaryMat, 0, h * 0.475, -d / 2 + 0.06);
                addBox(w * 0.38, 0.12, 0.42, whiteMat, -w * 0.23, h * 0.53, -d * 0.32);
                addBox(w * 0.38, 0.12, 0.42, whiteMat, w * 0.23, h * 0.53, -d * 0.32);
                break;
            }
            case 'sofa': {
                addBox(w, h * 0.42, d, primaryMat, 0, h * 0.21, 0);
                addBox(w, h * 0.55, d * 0.24, primaryMat, 0, h * 0.65, -d * 0.38);
                addBox(w * 0.12, h * 0.62, d * 0.96, primaryMat, -w * 0.44, h * 0.31, 0);
                addBox(w * 0.12, h * 0.62, d * 0.96, primaryMat, w * 0.44, h * 0.31, 0);
                break;
            }
            case 'chair': {
                addBox(w * 0.85, h * 0.14, d * 0.85, primaryMat, 0, h * 0.45, 0);
                addBox(w * 0.85, h * 0.52, 0.10, primaryMat, 0, h * 0.72, -d * 0.37);
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
                    addBox(0.06, h * 0.45, 0.06, darkMat, sx * w * 0.34, h * 0.225, sz * d * 0.34);
                });
                break;
            }
            case 'table':
            case 'desk':
            case 'dining_table': {
                addBox(w, 0.07, d, primaryMat, 0, h - 0.035, 0);
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
                    addBox(0.07, h - 0.07, 0.07, darkMat, sx * (w * 0.44), (h - 0.07) / 2, sz * (d * 0.42));
                });
                break;
            }
            case 'wardrobe':
            case 'cabinet': {
                addBox(w, h, d, primaryMat, 0, h / 2, 0);
                addBox(0.02, h * 0.92, 0.02, darkMat, 0, h / 2, d / 2 + 0.01);
                addBox(0.03, 0.24, 0.03, darkMat, -0.08, h * 0.52, d / 2 + 0.02);
                addBox(0.03, 0.24, 0.03, darkMat, 0.08, h * 0.52, d / 2 + 0.02);
                break;
            }
            case 'bookshelf': {
                addBox(0.05, h, d, primaryMat, -w / 2 + 0.025, h / 2, 0);
                addBox(0.05, h, d, primaryMat, w / 2 - 0.025, h / 2, 0);
                for (let s = 0; s < 5; s++) {
                    addBox(w, 0.04, d, primaryMat, 0, (s * (h - 0.05)) / 4 + 0.02, 0);
                }
                break;
            }
            case 'tv_unit': {
                addBox(w, h * 0.42, d, primaryMat, 0, h * 0.21, 0);
                addBox(w * 0.78, h * 0.52, 0.06, darkMat, 0, h * 0.74, 0);
                addBox(0.24, 0.12, 0.14, darkMat, 0, h * 0.46, 0);
                break;
            }
            case 'floor_lamp':
            case 'table_lamp': {
                const base = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.4, 0.05, 20), darkMat);
                base.position.y = 0.025;
                group.add(base);
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, h * 0.82, 12), primaryMat);
                pole.position.y = h * 0.41;
                group.add(pole);
                const shadeMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, emissive: 0xFBBF24, emissiveIntensity: 0.45 });
                const shade = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.28, w * 0.44, h * 0.26, 20), shadeMat);
                shade.position.y = h * 0.86;
                group.add(shade);
                break;
            }
            case 'plant': {
                const pot = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.32, w * 0.24, h * 0.34, 18), whiteMat);
                pot.position.y = h * 0.17;
                pot.castShadow = true;
                group.add(pot);
                const foliageMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.75 });
                const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(w * 0.45, 1), foliageMat);
                foliage.position.y = h * 0.64;
                foliage.castShadow = true;
                group.add(foliage);
                break;
            }
            case 'rug': {
                addBox(w, 0.025, d, primaryMat, 0, 0.0125, 0);
                break;
            }
            case 'curtain': {
                addBox(w + 0.16, 0.04, 0.05, darkMat, 0, h, 0);
                addBox(w * 0.44, h, d, primaryMat, -w * 0.27, h / 2, 0);
                addBox(w * 0.44, h, d, primaryMat, w * 0.27, h / 2, 0);
                break;
            }
            case 'painting':
            case 'mirror': {
                addBox(w, h, d, primaryMat, 0, h / 2 + 1.1, 0);
                break;
            }
            default: {
                addBox(w, h, d, primaryMat, 0, h / 2, 0);
            }
        }

        group.userData = {
            uid: state.uid || RoomifyUtils.generateId(),
            sku: itemData.sku,
            name: itemData.name,
            category: itemData.category,
            categoryLabel: itemData.categoryLabel,
            price: itemData.price,
            baseWidth: itemData.width,
            baseHeight: itemData.height,
            baseDepth: itemData.depth,
            color: color,
            material: materialType,
            isRoomifyFurniture: true
        };

        group.position.set(state.x || 0, state.y || 0, state.z || 0);
        group.rotation.y = state.rotY || 0;
        const sc = state.scale || 1;
        group.scale.set(sc, sc, sc);

        return group;
    }
};
