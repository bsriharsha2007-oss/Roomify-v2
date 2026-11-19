const RoomifyMaterials = {
    textureCache: {},

    createProceduralTexture(type, baseHex = '#C69C6D') {
        const key = `${type}_${baseHex}`;
        if (this.textureCache[key]) return this.textureCache[key];

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 512, 512);

        if (type === 'wood') {
            for (let i = 0; i < 8; i++) {
                const x = i * 64;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
                ctx.fillRect(x, 0, 62, 512);
                ctx.fillStyle = 'rgba(45, 25, 10, 0.22)';
                ctx.fillRect(x + 62, 0, 2, 512);
            }
        } else if (type === 'marble') {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 3;
            for (let v = 0; v < 12; v++) {
                ctx.beginPath();
                ctx.moveTo(0, v * 45);
                ctx.bezierCurveTo(170, v * 45 + 35, 340, v * 45 - 30, 512, v * 45 + 15);
                ctx.stroke();
            }
        } else if (type === 'ceramic') {
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
            ctx.lineWidth = 3;
            for (let g = 0; g <= 512; g += 64) {
                ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, 512); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(512, g); ctx.stroke();
            }
        } else if (type === 'granite') {
            for (let s = 0; s < 1400; s++) {
                ctx.fillStyle = s % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.22)';
                ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
            }
        } else if (type === 'carpet' || type === 'fabric') {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            for (let y = 0; y < 512; y += 6) {
                for (let x = (y % 12 === 0 ? 0 : 3); x < 512; x += 6) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        } else if (type === 'brick') {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let row = 0; row < 16; row++) {
                const y = row * 32;
                ctx.fillRect(0, y, 512, 3);
                const offset = (row % 2) * 32;
                for (let col = 0; col < 8; col++) {
                    ctx.fillRect(col * 64 + offset, y, 3, 32);
                }
            }
        } else if (type === 'wood_panel') {
            for (let x = 0; x < 512; x += 24) {
                ctx.fillStyle = 'rgba(30, 20, 10, 0.25)';
                ctx.fillRect(x, 0, 5, 512);
            }
        } else if (type === 'wallpaper_stripe') {
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            for (let x = 0; x < 512; x += 32) {
                ctx.fillRect(x, 0, 14, 512);
            }
        } else if (type === 'wallpaper_geo') {
            ctx.strokeStyle = 'rgba(255,255,255,0.28)';
            ctx.lineWidth = 2;
            for (let y = 0; y < 512; y += 64) {
                for (let x = 0; x < 512; x += 64) {
                    ctx.strokeRect(x + 8, y + 8, 48, 48);
                }
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        this.textureCache[key] = tex;
        return tex;
    },

    buildFurnitureMaterial(materialType, hexColor) {
        const color = new THREE.Color(hexColor);
        switch (materialType) {
            case 'metal':
                return new THREE.MeshStandardMaterial({ color, metalness: 0.78, roughness: 0.24 });
            case 'glass':
                return new THREE.MeshPhysicalMaterial({ color, metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.65 });
            case 'marble':
                return new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    map: this.createProceduralTexture('marble', hexColor),
                    roughness: 0.18,
                    metalness: 0.08
                });
            case 'leather':
                return new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.05 });
            case 'fabric':
                return new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    map: this.createProceduralTexture('fabric', hexColor),
                    roughness: 0.88,
                    metalness: 0.02
                });
            case 'wood':
            default:
                return new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    map: this.createProceduralTexture('wood', hexColor),
                    roughness: 0.58,
                    metalness: 0.05
                });
        }
    },

    THEMES: [
        {
            name: 'Modern Minimalist',
            desc: 'Crisp off-whites, warm oak & charcoal accents',
            swatches: ['#F8FAFC', '#C69C6D', '#334155', '#94A3B8'],
            wallColor: '#F8FAFC',
            wallFinish: 'paint',
            floorType: 'wood',
            floorTint: '#D2B48C',
            furniturePalette: ['#334155', '#E2E8F0', '#94A3B8', '#C69C6D'],
            lightMode: 'day'
        },
        {
            name: 'Contemporary',
            desc: 'Soft slate walls, marble floors & deep navy',
            swatches: ['#E2E8F0', '#F1F5F9', '#1E3A8A', '#64748B'],
            wallColor: '#E2E8F0',
            wallFinish: 'plaster',
            floorType: 'marble',
            floorTint: '#F1F5F9',
            furniturePalette: ['#1E3A8A', '#475569', '#CBD5E1', '#0F172A'],
            lightMode: 'day'
        },
        {
            name: 'Scandinavian',
            desc: 'Airy birch tones, light neutrals & terracotta',
            swatches: ['#FFFDF9', '#DEB887', '#D97757', '#CBD5E1'],
            wallColor: '#FFFDF9',
            wallFinish: 'paint',
            floorType: 'wood',
            floorTint: '#E6CCB2',
            furniturePalette: ['#D97757', '#EAE0D5', '#8D99AE', '#B08968'],
            lightMode: 'day'
        },
        {
            name: 'Industrial',
            desc: 'Exposed brick walls, dark granite & cognac leather',
            swatches: ['#9A3412', '#334155', '#7C2D12', '#1E293B'],
            wallColor: '#9A3412',
            wallFinish: 'brick',
            floorType: 'granite',
            floorTint: '#475569',
            furniturePalette: ['#7C2D12', '#1E293B', '#57534E', '#92400E'],
            lightMode: 'night'
        },
        {
            name: 'Traditional Indian',
            desc: 'Warm sandalwood walls, teak furniture & royal marigold',
            swatches: ['#FEF3C7', '#78350F', '#B45309', '#991B1B'],
            wallColor: '#FEF3C7',
            wallFinish: 'plaster',
            floorType: 'marble',
            floorTint: '#FDE68A',
            furniturePalette: ['#78350F', '#991B1B', '#B45309', '#92400E'],
            lightMode: 'day'
        },
        {
            name: 'Luxury',
            desc: 'Velvet charcoal, gold metallic accents & Carrara stone',
            swatches: ['#1E293B', '#F8FAFC', '#D4AF37', '#312E81'],
            wallColor: '#334155',
            wallFinish: 'wood_panel',
            floorType: 'marble',
            floorTint: '#F8FAFC',
            furniturePalette: ['#1E293B', '#D4AF37', '#312E81', '#F1F5F9'],
            lightMode: 'night'
        },
        {
            name: 'Bohemian',
            desc: 'Sage botanicals, warm rattan & woven textures',
            swatches: ['#ECFDF5', '#B08968', '#047857', '#D97706'],
            wallColor: '#ECFDF5',
            wallFinish: 'wallpaper_geo',
            floorType: 'wood',
            floorTint: '#B08968',
            furniturePalette: ['#047857', '#D97706', '#92400E', '#FDE68A'],
            lightMode: 'day'
        },
        {
            name: 'Classic',
            desc: 'Timeless striped wainscoting, walnut & ivory',
            swatches: ['#F3E8D2', '#5C4033', '#1E3A8A', '#7F1D1D'],
            wallColor: '#F3E8D2',
            wallFinish: 'wallpaper_stripe',
            floorType: 'wood',
            floorTint: '#8B5A2B',
            furniturePalette: ['#5C4033', '#7F1D1D', '#1E3A8A', '#D6C7B2'],
            lightMode: 'day'
        }
    ]
};
