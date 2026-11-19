document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const designId = params.get('id');

    const mount = document.getElementById('threeCanvasMount');
    const getViewportSize = () => ({
        w: mount.clientWidth || Math.max(400, window.innerWidth - 648),
        h: mount.clientHeight || Math.max(400, window.innerHeight - 54)
    });

    const initialSize = getViewportSize();
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(initialSize.w, initialSize.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    RoomifyCamera.init(renderer, mount);
    RoomifyLighting.init(scene);

    const gridHelper = new THREE.GridHelper(16, 32, 0x94A3B8, 0xCBD5E1);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);

    let placedObjects = [];
    let selectedObject = null;
    const selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0x1A73E8);
    selectionBox.visible = false;
    scene.add(selectionBox);

    let historyStack = [];
    let redoStack = [];
    let currentDesignRecord = null;
    let snapToGrid = true;

    const roomState = {
        width: 5.4,
        length: 4.6,
        height: 2.8,
        thickness: 0.18,
        shape: 'rectangle',
        hasDoor: true,
        doorOffset: 1.2,
        hasWindow: true,
        windowOffset: 0
    };

    const wallStyles = {
        north: { color: '#F3F4F6', finish: 'paint' },
        south: { color: '#F3F4F6', finish: 'paint' },
        east: { color: '#F3F4F6', finish: 'paint' },
        west: { color: '#F3F4F6', finish: 'paint' }
    };

    const floorStyle = { type: 'wood', tint: '#C69C6D' };
    let activeThemeName = 'Scandinavian';

    function rebuildRoom() {
        while (roomGroup.children.length) roomGroup.remove(roomGroup.children[0]);

        const { width: W, length: L, height: H, thickness: T } = roomState;

        const floorTex = RoomifyMaterials.createProceduralTexture(floorStyle.type, floorStyle.tint);
        floorTex.repeat.set(Math.max(1, W / 1.5), Math.max(1, L / 1.5));
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: floorStyle.type === 'marble' ? 0.2 : 0.72,
            metalness: floorStyle.type === 'marble' ? 0.1 : 0.03
        });
        const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, L), floorMat);
        floorMesh.position.y = -0.06;
        floorMesh.receiveShadow = true;
        roomGroup.add(floorMesh);

        const capMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

        const makeWallMat = (side) => {
            const st = wallStyles[side];
            if (st.finish === 'paint') {
                return new THREE.MeshStandardMaterial({ color: new THREE.Color(st.color), roughness: 0.85 });
            }
            return new THREE.MeshStandardMaterial({
                map: RoomifyMaterials.createProceduralTexture(st.finish, st.color),
                roughness: 0.75
            });
        };

        const addWallSegment = (w, h, d, x, y, z, side) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeWallMat(side));
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            roomGroup.add(mesh);

            const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.005, 0.035, d + 0.005), capMat);
            cap.position.set(x, y + h / 2 + 0.017, z);
            roomGroup.add(cap);
        };

        if (roomState.hasDoor) {
            const doorW = 0.95;
            const doorH = Math.min(2.1, H - 0.25);
            const doorX = THREE.MathUtils.clamp(roomState.doorOffset, -W / 2 + 0.7, W / 2 - 0.7);
            const leftSpan = (doorX - doorW / 2) - (-W / 2);
            const rightSpan = (W / 2) - (doorX + doorW / 2);
            if (leftSpan > 0.1) addWallSegment(leftSpan, H, T, -W / 2 + leftSpan / 2, H / 2, -L / 2 - T / 2, 'north');
            if (rightSpan > 0.1) addWallSegment(rightSpan, H, T, W / 2 - rightSpan / 2, H / 2, -L / 2 - T / 2, 'north');
            addWallSegment(doorW, H - doorH, T, doorX, doorH + (H - doorH) / 2, -L / 2 - T / 2, 'north');
        } else {
            addWallSegment(W + T * 2, H, T, 0, H / 2, -L / 2 - T / 2, 'north');
        }

        if (roomState.hasWindow) {
            const winW = 1.45;
            const sillH = 0.95;
            const winH = 1.15;
            const winZ = THREE.MathUtils.clamp(roomState.windowOffset, -L / 2 + 0.9, L / 2 - 0.9);
            const backSpan = (winZ - winW / 2) - (-L / 2);
            const frontSpan = (L / 2) - (winZ + winW / 2);
            if (backSpan > 0.1) addWallSegment(T, H, backSpan, -W / 2 - T / 2, H / 2, -L / 2 + backSpan / 2, 'west');
            if (frontSpan > 0.1) addWallSegment(T, H, frontSpan, -W / 2 - T / 2, H / 2, L / 2 - frontSpan / 2, 'west');
            addWallSegment(T, sillH, winW, -W / 2 - T / 2, sillH / 2, winZ, 'west');
            addWallSegment(T, H - (sillH + winH), winW, -W / 2 - T / 2, sillH + winH + (H - sillH - winH) / 2, winZ, 'west');

            const glass = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, winH, winW),
                new THREE.MeshPhysicalMaterial({ color: 0xBAE6FD, transparent: true, opacity: 0.42, roughness: 0.05 })
            );
            glass.position.set(-W / 2 - T / 2, sillH + winH / 2, winZ);
            roomGroup.add(glass);
        } else {
            addWallSegment(T, H, L, -W / 2 - T / 2, H / 2, 0, 'west');
        }

        const cutawayH = 0.36;
        addWallSegment(W + T * 2, cutawayH, T, 0, cutawayH / 2, L / 2 + T / 2, 'south');
        addWallSegment(T, cutawayH, L, W / 2 + T / 2, cutawayH / 2, 0, 'east');

        if (roomState.shape === 'alcove') {
            addWallSegment(W * 0.38, H * 0.85, T, -W / 2 + (W * 0.19), (H * 0.85) / 2, 0, 'north');
        }

        document.getElementById('roomDimHudBadge').innerHTML =
            `<i class="fa-solid fa-ruler"></i> ${W.toFixed(1)}m × ${L.toFixed(1)}m × ${H.toFixed(1)}m`;
    }

    function serializeItems() {
        return placedObjects.map(obj => ({
            uid: obj.userData.uid,
            sku: obj.userData.sku,
            x: Number(obj.position.x.toFixed(3)),
            y: Number(obj.position.y.toFixed(3)),
            z: Number(obj.position.z.toFixed(3)),
            rotY: Number(obj.rotation.y.toFixed(4)),
            scale: Number(obj.scale.x.toFixed(3)),
            color: obj.userData.color,
            material: obj.userData.material
        }));
    }

    function pushHistory() {
        historyStack.push(JSON.stringify(serializeItems()));
        if (historyStack.length > 35) historyStack.shift();
        redoStack = [];
    }

    function restoreItemsFromArray(itemsArr) {
        while (furnitureGroup.children.length) furnitureGroup.remove(furnitureGroup.children[0]);
        placedObjects = [];
        selectObject(null);

        (itemsArr || []).forEach(st => {
            const catItem = RoomifyFurniture.getBySku(st.sku);
            const mesh = RoomifyFurniture.buildMesh(catItem, st);
            furnitureGroup.add(mesh);
            placedObjects.push(mesh);
        });

        RoomifyBudget.update(placedObjects);
        checkCollisions();
    }

    function clampToRoomBounds(obj) {
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const halfW = roomState.width / 2 - size.x / 2;
        const halfL = roomState.length / 2 - size.z / 2;
        obj.position.x = THREE.MathUtils.clamp(obj.position.x, -Math.max(0.1, halfW), Math.max(0.1, halfW));
        obj.position.z = THREE.MathUtils.clamp(obj.position.z, -Math.max(0.1, halfL), Math.max(0.1, halfL));
    }

    function checkCollisions() {
        let hasOverlap = false;
        for (let i = 0; i < placedObjects.length; i++) {
            if (placedObjects[i].userData.sku === 'DEC-RUG-02') continue;
            const boxA = new THREE.Box3().setFromObject(placedObjects[i]).expandByScalar(-0.04);
            for (let j = i + 1; j < placedObjects.length; j++) {
                if (placedObjects[j].userData.sku === 'DEC-RUG-02') continue;
                const boxB = new THREE.Box3().setFromObject(placedObjects[j]).expandByScalar(-0.04);
                if (boxA.intersectsBox(boxB)) {
                    hasOverlap = true;
                    break;
                }
            }
        }
        document.getElementById('collisionBanner').classList.toggle('hidden', !hasOverlap);
        selectionBox.material.color.setHex(hasOverlap ? 0xDC2626 : 0x1A73E8);
    }

    function selectObject(obj) {
        selectedObject = obj;
        const emptyState = document.getElementById('noSelectionState');
        const propForm = document.getElementById('objectPropertiesForm');
        const ctxMenu = document.getElementById('floatingContextMenu');
        const badge = document.getElementById('selectedBadge');

        if (!obj) {
            selectionBox.visible = false;
            emptyState.classList.remove('hidden');
            propForm.classList.add('hidden');
            ctxMenu.classList.add('hidden');
            badge.textContent = 'Room Overview';
            return;
        }

        selectionBox.setFromObject(obj);
        selectionBox.visible = true;
        emptyState.classList.add('hidden');
        propForm.classList.remove('hidden');
        ctxMenu.classList.remove('hidden');
        badge.textContent = obj.userData.categoryLabel;

        document.getElementById('propItemName').textContent = obj.userData.name;
        document.getElementById('propItemCategory').textContent = obj.userData.categoryLabel;
        document.getElementById('propItemPrice').textContent = RoomifyUtils.formatINR(obj.userData.price);

        const sc = obj.scale.x;
        document.getElementById('propWidth').value = (obj.userData.baseWidth * sc).toFixed(2);
        document.getElementById('propHeight').value = (obj.userData.baseHeight * sc).toFixed(2);
        document.getElementById('propDepth').value = (obj.userData.baseDepth * sc).toFixed(2);
        document.getElementById('propScaleSlider').value = sc.toFixed(2);
        document.getElementById('propScaleVal').textContent = `${sc.toFixed(2)}x`;

        document.getElementById('propPosX').value = obj.position.x.toFixed(2);
        document.getElementById('propPosY').value = obj.position.y.toFixed(2);
        document.getElementById('propPosZ').value = obj.position.z.toFixed(2);

        const deg = Math.round(((obj.rotation.y * 180) / Math.PI + 360) % 360);
        document.getElementById('propRotSlider').value = deg;
        document.getElementById('propRotVal').textContent = `${deg}°`;
        document.getElementById('propCustomColor').value = obj.userData.color;
        document.getElementById('propMaterialSelect').value = obj.userData.material;

        const catItem = RoomifyFurniture.getBySku(obj.userData.sku);
        const swatchWrap = document.getElementById('propColorSwatches');
        swatchWrap.innerHTML = (catItem.colors || []).map(c =>
            `<button class="swatch-dot ${c.toLowerCase() === obj.userData.color.toLowerCase() ? 'active' : ''}" style="background:${c}" data-item-color="${c}"></button>`
        ).join('');
    }

    function addFurnitureToScene(sku, pos = { x: 0, z: 0 }) {
        pushHistory();
        const itemData = RoomifyFurniture.getBySku(sku);
        const mesh = RoomifyFurniture.buildMesh(itemData, { x: pos.x, y: 0, z: pos.z });
        clampToRoomBounds(mesh);
        furnitureGroup.add(mesh);
        placedObjects.push(mesh);
        selectObject(mesh);
        RoomifyBudget.update(placedObjects);
        checkCollisions();
        RoomifyUtils.toast(`Added ${itemData.name}`, 'success');
    }

    function rebuildSelectedAppearance(newColor, newMat) {
        if (!selectedObject) return;
        pushHistory();
        const st = {
            uid: selectedObject.userData.uid,
            sku: selectedObject.userData.sku,
            x: selectedObject.position.x,
            y: selectedObject.position.y,
            z: selectedObject.position.z,
            rotY: selectedObject.rotation.y,
            scale: selectedObject.scale.x,
            color: newColor || selectedObject.userData.color,
            material: newMat || selectedObject.userData.material
        };
        const idx = placedObjects.indexOf(selectedObject);
        furnitureGroup.remove(selectedObject);
        const freshMesh = RoomifyFurniture.buildMesh(RoomifyFurniture.getBySku(st.sku), st);
        furnitureGroup.add(freshMesh);
        if (idx !== -1) placedObjects[idx] = freshMesh;
        selectObject(freshMesh);
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    let isDraggingFurniture = false;
    let dragOffset = new THREE.Vector3();

    const updateMouseCoords = (clientX, clientY) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const findRootFurniture = (hitObj) => {
        let curr = hitObj;
        while (curr) {
            if (curr.userData && curr.userData.isRoomifyFurniture) return curr;
            curr = curr.parent;
        }
        return null;
    };

    renderer.domElement.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        updateMouseCoords(e.clientX, e.clientY);
        raycaster.setFromCamera(mouse, RoomifyCamera.activeCamera);
        const hits = raycaster.intersectObjects(furnitureGroup.children, true);

        if (hits.length > 0) {
            const root = findRootFurniture(hits[0].object);
            if (root) {
                selectObject(root);
                isDraggingFurniture = true;
                RoomifyCamera.controls.enabled = false;
                pushHistory();
                raycaster.ray.intersectPlane(dragPlane, intersectPoint);
                dragOffset.subVectors(root.position, intersectPoint);
            }
        } else {
            selectObject(null);
        }
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDraggingFurniture || !selectedObject) return;
        updateMouseCoords(e.clientX, e.clientY);
        raycaster.setFromCamera(mouse, RoomifyCamera.activeCamera);
        if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
            let nx = intersectPoint.x + dragOffset.x;
            let nz = intersectPoint.z + dragOffset.z;
            if (snapToGrid) {
                nx = Math.round(nx * 10) / 10;
                nz = Math.round(nz * 10) / 10;
            }
            selectedObject.position.x = nx;
            selectedObject.position.z = nz;
            clampToRoomBounds(selectedObject);
            selectionBox.setFromObject(selectedObject);
            document.getElementById('propPosX').value = selectedObject.position.x.toFixed(2);
            document.getElementById('propPosZ').value = selectedObject.position.z.toFixed(2);
            checkCollisions();
        }
    });

    window.addEventListener('pointerup', () => {
        if (isDraggingFurniture) {
            isDraggingFurniture = false;
            RoomifyCamera.controls.enabled = true;
        }
    });

    mount.addEventListener('dragover', e => e.preventDefault());
    mount.addEventListener('drop', (e) => {
        e.preventDefault();
        const sku = e.dataTransfer.getData('text/plain');
        if (!sku) return;
        updateMouseCoords(e.clientX, e.clientY);
        raycaster.setFromCamera(mouse, RoomifyCamera.activeCamera);
        if (raycaster.ray.intersectPlane(dragPlane, intersectPoint)) {
            addFurnitureToScene(sku, { x: intersectPoint.x, z: intersectPoint.z });
        } else {
            addFurnitureToScene(sku, { x: 0, z: 0 });
        }
    });

    document.querySelectorAll('.rail-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.rail-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.drawer-pane').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.panel).classList.add('active');
        });
    });

    document.getElementById('openBudgetDrawerBtn').addEventListener('click', () => {
        document.querySelector('[data-panel="budgetPanel"]').click();
    });

    function renderCatalog() {
        const q = document.getElementById('catalogSearchInput').value.toLowerCase();
        const cat = document.getElementById('catalogCategorySelect').value;
        const maxPrice = Number(document.getElementById('catalogPriceRange').value);
        document.getElementById('maxPriceLabel').textContent = RoomifyUtils.formatINR(maxPrice);

        const filtered = RoomifyFurniture.CATALOG.filter(item => {
            const okCat = cat === 'all' || item.category === cat;
            const okPrice = item.price <= maxPrice;
            const okSearch = !q || item.name.toLowerCase().includes(q) || item.categoryLabel.toLowerCase().includes(q);
            return okCat && okPrice && okSearch;
        });

        const buildCard = (item) => `
            <div class="cat-item-card" draggable="true" data-sku="${item.sku}">
                <div>
                    <div class="cat-thumb"><i class="fa-solid ${item.icon}"></i></div>
                    <h5>${item.name}</h5>
                    <div class="cat-dims">${item.width}m × ${item.depth}m × ${item.height}m</div>
                </div>
                <div class="cat-card-foot">
                    <span class="cat-price">${RoomifyUtils.formatINR(item.price)}</span>
                    <button class="add-mini-btn" title="Place in Room">+</button>
                </div>
            </div>
        `;

        document.getElementById('furnitureCatalogGrid').innerHTML = filtered.map(buildCard).join('');
        const decorItems = RoomifyFurniture.CATALOG.filter(i => ['decor', 'curtains', 'lamps'].includes(i.category));
        document.getElementById('decorCatalogGrid').innerHTML = decorItems.map(buildCard).join('');
    }

    ['catalogSearchInput', 'catalogCategorySelect', 'catalogPriceRange'].forEach(id => {
        document.getElementById(id).addEventListener('input', renderCatalog);
    });

    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.cat-item-card');
        if (card) addFurnitureToScene(card.dataset.sku);

        const quickBtn = e.target.closest('[data-quick-sku]');
        if (quickBtn) addFurnitureToScene(quickBtn.dataset.quickSku);
    });

    document.body.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.cat-item-card');
        if (card) e.dataTransfer.setData('text/plain', card.dataset.sku);
    });

    document.getElementById('applyRoomDimsBtn').addEventListener('click', () => {
        roomState.width = parseFloat(document.getElementById('roomWidthInput').value) || 5.2;
        roomState.length = parseFloat(document.getElementById('roomLengthInput').value) || 4.4;
        roomState.height = parseFloat(document.getElementById('wallHeightInput').value) || 2.8;
        roomState.thickness = parseFloat(document.getElementById('wallThickInput').value) || 0.18;
        roomState.shape = document.getElementById('roomShapeSelect').value;
        rebuildRoom();
        placedObjects.forEach(clampToRoomBounds);
        RoomifyUtils.toast('Room dimensions updated.', 'success');
    });

    ['toggleDoorCheck', 'doorPosSlider', 'toggleWindowCheck', 'windowPosSlider'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            roomState.hasDoor = document.getElementById('toggleDoorCheck').checked;
            roomState.doorOffset = parseFloat(document.getElementById('doorPosSlider').value);
            roomState.hasWindow = document.getElementById('toggleWindowCheck').checked;
            roomState.windowOffset = parseFloat(document.getElementById('windowPosSlider').value);
            rebuildRoom();
        });
    });

    document.getElementById('toggleDimsCheck').addEventListener('change', (e) => {
        gridHelper.visible = e.target.checked;
        document.getElementById('roomDimHudBadge').classList.toggle('hidden', !e.target.checked);
    });

    document.getElementById('toggleSnapCheck').addEventListener('change', (e) => {
        snapToGrid = e.target.checked;
    });

    const wallColors = ['#F3F4F6', '#FFFFFF', '#FEF3C7', '#E0F2FE', '#ECFDF5', '#FCE7F3', '#CBD5E1', '#334155', '#9A3412'];
    document.getElementById('wallColorSwatches').innerHTML = wallColors.map(c =>
        `<button class="swatch-dot" style="background:${c}" data-wall-color="${c}"></button>`
    ).join('');

    const applyWallChange = (color, finish) => {
        const target = document.getElementById('targetWallSelect').value;
        const sides = target === 'all' ? ['north', 'south', 'east', 'west'] : [target];
        sides.forEach(s => {
            if (color) wallStyles[s].color = color;
            if (finish) wallStyles[s].finish = finish;
        });
        rebuildRoom();
    };

    document.getElementById('wallColorSwatches').addEventListener('click', (e) => {
        if (e.target.dataset.wallColor) {
            document.getElementById('wallCustomColor').value = e.target.dataset.wallColor;
            applyWallChange(e.target.dataset.wallColor, null);
        }
    });

    document.getElementById('wallCustomColor').addEventListener('input', (e) => applyWallChange(e.target.value, null));

    document.getElementById('wallFinishGrid').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wall-finish]');
        if (!btn) return;
        document.querySelectorAll('[data-wall-finish]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyWallChange(null, btn.dataset.wallFinish);
    });

    document.getElementById('floorTypeGrid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-floor]');
        if (!card) return;
        document.querySelectorAll('[data-floor]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        floorStyle.type = card.dataset.floor;
        rebuildRoom();
    });

    document.getElementById('floorTintColor').addEventListener('input', (e) => {
        floorStyle.tint = e.target.value;
        rebuildRoom();
    });

    const lightColors = ['#FFFDF7', '#FDE68A', '#FDBA74', '#E0F2FE', '#C7D2FE'];
    document.getElementById('lightColorSwatches').innerHTML = lightColors.map(c =>
        `<button class="swatch-dot" style="background:${c}" data-light-color="${c}"></button>`
    ).join('');

    document.getElementById('lightColorSwatches').addEventListener('click', (e) => {
        if (e.target.dataset.lightColor) RoomifyLighting.applyState(scene, { color: e.target.dataset.lightColor });
    });

    document.getElementById('dayModeBtn').addEventListener('click', () => RoomifyLighting.applyState(scene, { mode: 'day' }));
    document.getElementById('nightModeBtn').addEventListener('click', () => RoomifyLighting.applyState(scene, { mode: 'night' }));
    document.getElementById('ambientIntensitySlider').addEventListener('input', e => RoomifyLighting.applyState(scene, { ambient: parseFloat(e.target.value) }));
    document.getElementById('mainLightIntensitySlider').addEventListener('input', e => RoomifyLighting.applyState(scene, { main: parseFloat(e.target.value) }));
    document.getElementById('addCeilingLightBtn').addEventListener('click', () => {
        RoomifyLighting.applyState(scene, { ceilingLight: !RoomifyLighting.state.ceilingLight });
        RoomifyUtils.toast('Ceiling fixture toggled.', 'info');
    });

    document.getElementById('themesListContainer').innerHTML = RoomifyMaterials.THEMES.map(t => `
        <div class="theme-card" data-theme-name="${t.name}">
            <div class="theme-swatches">${t.swatches.map(s => `<span style="background:${s}"></span>`).join('')}</div>
            <strong>${t.name}</strong>
            <small>${t.desc}</small>
        </div>
    `).join('');

    document.getElementById('themesListContainer').addEventListener('click', (e) => {
        const card = e.target.closest('[data-theme-name]');
        if (!card) return;
        const theme = RoomifyMaterials.THEMES.find(t => t.name === card.dataset.themeName);
        if (!theme) return;

        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activeThemeName = theme.name;
        document.getElementById('propActiveTheme').textContent = theme.name;

        ['north', 'south', 'east', 'west'].forEach(s => {
            wallStyles[s] = { color: theme.wallColor, finish: theme.wallFinish };
        });
        floorStyle.type = theme.floorType;
        floorStyle.tint = theme.floorTint;
        rebuildRoom();

        RoomifyLighting.applyState(scene, { mode: theme.lightMode });

        if (placedObjects.length > 0) {
            pushHistory();
            const updated = serializeItems().map((item, idx) => ({
                ...item,
                color: theme.furniturePalette[idx % theme.furniturePalette.length]
            }));
            restoreItemsFromArray(updated);
        }
        RoomifyUtils.toast(`Applied ${theme.name} theme!`, 'success');
    });

    const rotateSelected = (degDelta) => {
        if (!selectedObject) return;
        pushHistory();
        selectedObject.rotation.y += (degDelta * Math.PI) / 180;
        selectObject(selectedObject);
        checkCollisions();
    };

    const duplicateSelected = () => {
        if (!selectedObject) return;
        addFurnitureToScene(selectedObject.userData.sku, {
            x: selectedObject.position.x + 0.45,
            z: selectedObject.position.z + 0.45
        });
    };

    const deleteSelected = () => {
        if (!selectedObject) return;
        pushHistory();
        furnitureGroup.remove(selectedObject);
        placedObjects = placedObjects.filter(o => o !== selectedObject);
        selectObject(null);
        RoomifyBudget.update(placedObjects);
        checkCollisions();
        RoomifyUtils.toast('Item removed.', 'info');
    };

    document.getElementById('ctxRotateBtn').addEventListener('click', () => rotateSelected(90));
    document.getElementById('ctxDuplicateBtn').addEventListener('click', duplicateSelected);
    document.getElementById('ctxFocusBtn').addEventListener('click', () => RoomifyCamera.focusObject(selectedObject));
    document.getElementById('ctxDeleteBtn').addEventListener('click', deleteSelected);

    document.getElementById('propRotPlus90').addEventListener('click', () => rotateSelected(90));
    document.getElementById('propRotMinus90').addEventListener('click', () => rotateSelected(-90));
    document.getElementById('propDuplicateBtn').addEventListener('click', duplicateSelected);
    document.getElementById('propDeleteBtn').addEventListener('click', deleteSelected);

    document.getElementById('propRotSlider').addEventListener('input', (e) => {
        if (!selectedObject) return;
        const deg = parseFloat(e.target.value);
        selectedObject.rotation.y = (deg * Math.PI) / 180;
        document.getElementById('propRotVal').textContent = `${deg}°`;
        selectionBox.setFromObject(selectedObject);
        checkCollisions();
    });

    document.getElementById('propScaleSlider').addEventListener('input', (e) => {
        if (!selectedObject) return;
        const sc = parseFloat(e.target.value);
        selectedObject.scale.set(sc, sc, sc);
        clampToRoomBounds(selectedObject);
        selectObject(selectedObject);
        checkCollisions();
    });

    ['propPosX', 'propPosY', 'propPosZ'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (!selectedObject) return;
            selectedObject.position.set(
                parseFloat(document.getElementById('propPosX').value) || 0,
                parseFloat(document.getElementById('propPosY').value) || 0,
                parseFloat(document.getElementById('propPosZ').value) || 0
            );
            clampToRoomBounds(selectedObject);
            selectionBox.setFromObject(selectedObject);
            checkCollisions();
        });
    });

    document.getElementById('propColorSwatches').addEventListener('click', (e) => {
        if (e.target.dataset.itemColor) rebuildSelectedAppearance(e.target.dataset.itemColor, null);
    });
    document.getElementById('propCustomColor').addEventListener('input', (e) => rebuildSelectedAppearance(e.target.value, null));
    document.getElementById('propMaterialSelect').addEventListener('change', (e) => rebuildSelectedAppearance(null, e.target.value));

    document.getElementById('budgetLimitInput').addEventListener('input', (e) => {
        RoomifyBudget.limit = parseFloat(e.target.value) || 200000;
        RoomifyBudget.update(placedObjects);
    });

    document.getElementById('view2dBtn').addEventListener('click', () => RoomifyCamera.setViewMode('2d', renderer));
    document.getElementById('view3dBtn').addEventListener('click', () => RoomifyCamera.setViewMode('3d', renderer));
    document.getElementById('viewIsoBtn').addEventListener('click', () => RoomifyCamera.setViewMode('iso', renderer));
    document.getElementById('resetCameraBtn').addEventListener('click', () => RoomifyCamera.setViewMode(RoomifyCamera.viewMode, renderer));
    document.getElementById('toggleOrthoBtn').addEventListener('click', () => RoomifyCamera.toggleProjection(renderer));

    document.getElementById('undoBtn').addEventListener('click', () => {
        if (!historyStack.length) return;
        redoStack.push(JSON.stringify(serializeItems()));
        restoreItemsFromArray(JSON.parse(historyStack.pop()));
        RoomifyUtils.toast('Undid last action.', 'info');
    });

    document.getElementById('redoBtn').addEventListener('click', () => {
        if (!redoStack.length) return;
        historyStack.push(JSON.stringify(serializeItems()));
        restoreItemsFromArray(JSON.parse(redoStack.pop()));
        RoomifyUtils.toast('Redid action.', 'info');
    });

    document.getElementById('resetRoomBtn').addEventListener('click', () => {
        pushHistory();
        restoreItemsFromArray([]);
        RoomifyUtils.toast('Room cleared.', 'info');
    });

    const refHelper = RoomifyExport.initReferencePhoto(designId);

    document.getElementById('exportPngBtn').addEventListener('click', () => {
        RoomifyExport.exportCleanPNG(
            renderer, scene, RoomifyCamera.activeCamera, gridHelper, selectionBox,
            document.getElementById('designNameInput').value
        );
    });

    async function persistCurrentDesign(silent = false) {
        const badge = document.getElementById('autosaveStatus');
        badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const thumb = RoomifyExport.captureThumbnail(renderer, scene, RoomifyCamera.activeCamera, gridHelper, selectionBox);
        const payload = {
            id: currentDesignRecord ? currentDesignRecord.id : null,
            name: document.getElementById('designNameInput').value.trim() || 'Untitled Room',
            room_type: document.getElementById('roomTypeSelect').value,
            theme: activeThemeName,
            room_width: roomState.width,
            room_length: roomState.length,
            wall_height: roomState.height,
            total_budget: RoomifyBudget.total,
            budget_limit: RoomifyBudget.limit,
            thumbnail: thumb,
            reference_image: RoomifyExport.referenceImageData,
            design_data: {
                room: roomState,
                walls: wallStyles,
                floor: floorStyle,
                lighting: RoomifyLighting.state,
                items: serializeItems()
            }
        };

        if (payload.id) {
            await RoomifyAPI.updateDesign(payload);
        } else {
            const created = await RoomifyAPI.saveNewDesign(payload);
            currentDesignRecord = { id: created.id };
            window.history.replaceState({}, '', `editor.html?id=${created.id}`);
        }

        badge.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
        if (!silent) RoomifyUtils.toast('Design saved successfully!', 'success');
    }

    document.getElementById('saveDesignBtn').addEventListener('click', () => persistCurrentDesign(false));
    setInterval(() => persistCurrentDesign(true), 45000);

    renderCatalog();
    const initialDesign = designId
        ? await RoomifyAPI.getDesign(designId)
        : RoomifyAPI.createDefaultStarterDesign();

    if (initialDesign) {
        currentDesignRecord = designId ? initialDesign : null;
        document.getElementById('designNameInput').value = initialDesign.name;
        document.getElementById('roomTypeSelect').value = initialDesign.room_type || 'Living Room';
        activeThemeName = initialDesign.theme || 'Scandinavian';
        document.getElementById('propActiveTheme').textContent = activeThemeName;
        RoomifyBudget.limit = Number(initialDesign.budget_limit) || 200000;
        document.getElementById('budgetLimitInput').value = RoomifyBudget.limit;

        const dData = initialDesign.design_data || {};
        if (dData.room) Object.assign(roomState, dData.room);
        if (dData.walls) Object.assign(wallStyles, dData.walls);
        if (dData.floor) Object.assign(floorStyle, dData.floor);
        if (dData.lighting) RoomifyLighting.applyState(scene, dData.lighting);
        if (initialDesign.reference_image) refHelper.showPhoto(initialDesign.reference_image);

        document.getElementById('roomWidthInput').value = roomState.width;
        document.getElementById('roomLengthInput').value = roomState.length;
        document.getElementById('wallHeightInput').value = roomState.height;

        rebuildRoom();
        restoreItemsFromArray(dData.items || []);
    } else {
        rebuildRoom();
    }

    const syncViewportSize = () => {
        const { w, h } = getViewportSize();
        RoomifyCamera.onResize(mount);
        renderer.setSize(w, h);
    };

    window.addEventListener('resize', syncViewportSize);
    if (window.ResizeObserver) {
        new ResizeObserver(syncViewportSize).observe(mount);
    }

    function animate() {
        requestAnimationFrame(animate);
        RoomifyCamera.controls.update();
        renderer.render(scene, RoomifyCamera.activeCamera);
    }
    animate();
});
