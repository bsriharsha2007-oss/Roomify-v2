const RoomifyExport = {
    referenceImageData: null,

    exportCleanPNG(renderer, scene, camera, gridHelper, selectionBox, designName) {
        const wasGridVisible = gridHelper ? gridHelper.visible : false;
        const wasBoxVisible = selectionBox ? selectionBox.visible : false;

        if (gridHelper) gridHelper.visible = false;
        if (selectionBox) selectionBox.visible = false;

        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');

        if (gridHelper) gridHelper.visible = wasGridVisible;
        if (selectionBox) selectionBox.visible = wasBoxVisible;
        renderer.render(scene, camera);

        const link = document.createElement('a');
        const safeFile = (designName || 'roomify-design').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${safeFile}-3d.png`;
        link.href = dataUrl;
        link.click();

        RoomifyUtils.toast('High-resolution PNG render downloaded!', 'success');
    },

    captureThumbnail(renderer, scene, camera, gridHelper, selectionBox) {
        const wasGridVisible = gridHelper ? gridHelper.visible : false;
        const wasBoxVisible = selectionBox ? selectionBox.visible : false;
        if (gridHelper) gridHelper.visible = false;
        if (selectionBox) selectionBox.visible = false;

        renderer.render(scene, camera);
        const thumb = renderer.domElement.toDataURL('image/jpeg', 0.65);

        if (gridHelper) gridHelper.visible = wasGridVisible;
        if (selectionBox) selectionBox.visible = wasBoxVisible;
        return thumb;
    },

    initReferencePhoto(designId, onPhotoChanged) {
        const input = document.getElementById('refPhotoInput');
        const card = document.getElementById('floatingRefCard');
        const img = document.getElementById('floatingRefImg');

        const showPhoto = (src) => {
            if (!src) {
                card.classList.add('hidden');
                return;
            }
            this.referenceImageData = src;
            img.src = src;
            card.classList.remove('hidden');
        };

        input?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = ev => {
                showPhoto(ev.target.result);
                if (onPhotoChanged) onPhotoChanged(ev.target.result);
            };
            reader.readAsDataURL(file);

            try {
                const formData = new FormData();
                formData.append('reference_image', file);
                if (designId) formData.append('design_id', designId);
                const res = await fetch('backend/api/upload_reference.php', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    this.referenceImageData = data.file_path;
                    RoomifyUtils.toast('Reference photo uploaded to server.', 'success');
                }
            } catch (err) {
                RoomifyUtils.toast('Reference photo loaded in workspace.', 'info');
            }
        });

        document.getElementById('removeRefPhotoBtn')?.addEventListener('click', () => {
            this.referenceImageData = null;
            input.value = '';
            card.classList.add('hidden');
            if (onPhotoChanged) onPhotoChanged(null);
            RoomifyUtils.toast('Reference photo removed.', 'info');
        });

        document.getElementById('closeFloatingRefBtn')?.addEventListener('click', () => {
            card.classList.add('hidden');
        });

        document.getElementById('toggleRefPhotoBtn')?.addEventListener('click', () => {
            if (!this.referenceImageData) {
                document.querySelector('[data-panel="budgetPanel"]').click();
                RoomifyUtils.toast('Upload a JPG or PNG room photo in the Budget & Reference tab.', 'info');
            } else {
                card.classList.toggle('hidden');
            }
        });

        return { showPhoto };
    }
};
