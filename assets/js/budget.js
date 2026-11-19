const RoomifyBudget = {
    limit: 200000,
    total: 0,

    update(placedObjects) {
        this.total = placedObjects.reduce((sum, obj) => sum + (Number(obj.userData.price) || 0), 0);
        const formatted = RoomifyUtils.formatINR(this.total);

        document.getElementById('headerTotalBudget').textContent = formatted;
        document.getElementById('panelTotalBudget').textContent = formatted;
        document.getElementById('panelItemCount').textContent = placedObjects.length;
        document.getElementById('propObjCount').textContent = `${placedObjects.length} items`;
        document.getElementById('propTotalCost').textContent = formatted;

        const pct = Math.min(100, Math.round((this.total / Math.max(1, this.limit)) * 100));
        const fill = document.getElementById('budgetProgressFill');
        const warn = document.getElementById('budgetWarningAlert');
        if (fill) {
            fill.style.width = `${pct}%`;
            fill.classList.toggle('over', this.total > this.limit);
        }
        if (warn) {
            warn.classList.toggle('hidden', this.total <= this.limit);
        }

        const catTotals = {};
        placedObjects.forEach(obj => {
            const cat = obj.userData.categoryLabel || 'Other';
            catTotals[cat] = (catTotals[cat] || 0) + (Number(obj.userData.price) || 0);
        });

        const bdList = document.getElementById('categoryBreakdownList');
        if (bdList) {
            bdList.innerHTML = Object.keys(catTotals).length
                ? Object.entries(catTotals).map(([cat, amt]) => `
                    <div class="bd-item">
                        <span>${cat}</span>
                        <strong>${RoomifyUtils.formatINR(amt)}</strong>
                    </div>
                `).join('')
                : '<div class="muted-small">No items placed yet.</div>';
        }

        const itemList = document.getElementById('itemizedBudgetList');
        if (itemList) {
            itemList.innerHTML = placedObjects.length
                ? placedObjects.map(obj => `
                    <div class="bd-item">
                        <span>${obj.userData.name}</span>
                        <strong>${RoomifyUtils.formatINR(obj.userData.price)}</strong>
                    </div>
                `).join('')
                : '';
        }

        return this.total;
    }
};
