const RoomifyCamera = {
    perspCamera: null,
    orthoCamera: null,
    activeCamera: null,
    controls: null,
    viewMode: '3d',
    isOrtho: false,

    getSafeAspect(container) {
        const w = container.clientWidth || Math.max(400, window.innerWidth - 648);
        const h = container.clientHeight || Math.max(400, window.innerHeight - 54);
        return w / h;
    },

    init(renderer, container) {
        const aspect = this.getSafeAspect(container);
        this.perspCamera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
        this.perspCamera.position.set(6.5, 6.2, 6.5);

        const frustum = 6.5;
        this.orthoCamera = new THREE.OrthographicCamera(
            -frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 100
        );
        this.orthoCamera.position.set(6.5, 6.2, 6.5);

        this.activeCamera = this.perspCamera;
        this.attachControls(renderer);
    },

    attachControls(renderer) {
        if (this.controls) this.controls.dispose();
        this.controls = new THREE.OrbitControls(this.activeCamera, renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
        this.controls.minDistance = 2.2;
        this.controls.maxDistance = 22;
        this.controls.target.set(0, 0.6, 0);
        this.controls.update();
    },

    setViewMode(mode, renderer) {
        this.viewMode = mode;
        document.querySelectorAll('.v-btn').forEach(b => b.classList.remove('active'));

        if (mode === '2d') {
            document.getElementById('view2dBtn')?.classList.add('active');
            this.isOrtho = true;
            this.activeCamera = this.orthoCamera;
            this.activeCamera.position.set(0, 12, 0.01);
            this.attachControls(renderer);
            this.controls.enableRotate = false;
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            document.getElementById('camProjLabel').textContent = '2D Ortho';
        } else if (mode === 'iso') {
            document.getElementById('viewIsoBtn')?.classList.add('active');
            this.isOrtho = true;
            this.activeCamera = this.orthoCamera;
            this.activeCamera.position.set(6.8, 6.5, 6.8);
            this.attachControls(renderer);
            this.controls.enableRotate = true;
            this.controls.target.set(0, 0.6, 0);
            this.controls.update();
            document.getElementById('camProjLabel').textContent = 'Isometric';
        } else {
            document.getElementById('view3dBtn')?.classList.add('active');
            this.isOrtho = false;
            this.activeCamera = this.perspCamera;
            this.activeCamera.position.set(6.4, 5.8, 6.4);
            this.attachControls(renderer);
            this.controls.enableRotate = true;
            this.controls.target.set(0, 0.6, 0);
            this.controls.update();
            document.getElementById('camProjLabel').textContent = 'Perspective';
        }
    },

    toggleProjection(renderer) {
        this.setViewMode(this.isOrtho ? '3d' : 'iso', renderer);
    },

    focusObject(obj) {
        if (!obj) return;
        this.controls.target.copy(obj.position);
        if (this.viewMode !== '2d') {
            this.activeCamera.position.set(obj.position.x + 2.8, obj.position.y + 2.6, obj.position.z + 2.8);
        }
        this.controls.update();
    },

    onResize(container) {
        const aspect = this.getSafeAspect(container);
        this.perspCamera.aspect = aspect;
        this.perspCamera.updateProjectionMatrix();

        const frustum = 6.5;
        this.orthoCamera.left = -frustum * aspect;
        this.orthoCamera.right = frustum * aspect;
        this.orthoCamera.top = frustum;
        this.orthoCamera.bottom = -frustum;
        this.orthoCamera.updateProjectionMatrix();
    }
};
