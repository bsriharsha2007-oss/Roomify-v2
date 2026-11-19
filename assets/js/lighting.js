const RoomifyLighting = {
    ambientLight: null,
    dirLight: null,
    ceilingLight: null,
    state: {
        mode: 'day',
        ambient: 0.65,
        main: 0.90,
        color: '#FFFDF7',
        ceilingLight: true
    },

    init(scene) {
        this.ambientLight = new THREE.AmbientLight(0xffffff, this.state.ambient);
        scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xfffdf7, this.state.main);
        this.dirLight.position.set(6, 10, 5);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 30;
        const d = 8;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.dirLight.shadow.bias = -0.0005;
        scene.add(this.dirLight);

        this.ceilingLight = new THREE.PointLight(0xfff3d6, 0.55, 14);
        this.ceilingLight.position.set(0, 2.55, 0);
        scene.add(this.ceilingLight);
    },

    applyState(scene, newState = {}) {
        this.state = { ...this.state, ...newState };
        const isNight = this.state.mode === 'night';

        scene.background = new THREE.Color(isNight ? 0x162032 : 0xE9EEF5);
        this.ambientLight.intensity = isNight ? Math.min(this.state.ambient, 0.35) : this.state.ambient;
        this.dirLight.intensity = isNight ? 0.25 : this.state.main;
        this.dirLight.color = new THREE.Color(isNight ? 0x7DA2FF : this.state.color);

        this.ceilingLight.visible = !!this.state.ceilingLight;
        this.ceilingLight.intensity = isNight ? 1.15 : 0.45;
        this.ceilingLight.color = new THREE.Color(this.state.color);

        document.getElementById('dayModeBtn')?.classList.toggle('active', !isNight);
        document.getElementById('nightModeBtn')?.classList.toggle('active', isNight);
        document.getElementById('ambientValLabel').textContent = `${Math.round(this.state.ambient * 100)}%`;
        document.getElementById('mainLightValLabel').textContent = `${Math.round(this.state.main * 100)}%`;
    }
};
