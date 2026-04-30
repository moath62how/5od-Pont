// filepath: js/leaderboard.js
// =====================================================
// LEADERBOARD - Leaderboard rendering functions
// =====================================================

const Leaderboard = {
    /**
     * Load and render leaderboard data
     */
    async load() {
        const users = await db.getUsers();

        if (!users || users.length === 0) return;

        this.renderTop3(users.slice(0, 3));
        this.renderLast3(users.slice(-3).reverse());
        this.renderAll(users);
    },

    /**
     * Generate avatar URL for a user
     */
    getAvatar(name) {
        const seed = encodeURIComponent(name);
        return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=4f46e5,7c3aed,db2777,dc2626,ea580c,ca8a04,16a34a,0891b2&backgroundType=gradientLinear`;
    },

    /**
     * Render top 3 users in a row with circles
     */
    renderTop3(users) {
        const box = document.getElementById("top3");
        if (!box) return;

        // Sort: 1st in middle, 2nd left, 3rd right
        const sorted = [users[1], users[0], users[2]].filter(Boolean);

        box.innerHTML = sorted.map((u, i) => {
            const isMiddle = i === 0;
            const rank = isMiddle ? 1 : (i === 1 ? 2 : 3);
            const size = isMiddle ? 'w-28 h-28' : 'w-16 h-16';
            const border = rank === 1 ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : (rank === 2 ? 'border-gray-300' : 'border-amber-600');
            const medal = rank === 1 ? 'fa-crown text-yellow-400' : (rank === 2 ? 'fa-medal text-gray-300' : 'fa-medal text-amber-600');

            return `
                <div class="flex flex-col items-center ${isMiddle ? 'mt-0' : 'mt-6'}">
                    ${rank === 1 ? '<i class="fas fa-halo text-3xl text-yellow-300 mb-1"></i>' : ''}
                    <img src="${this.getAvatar(u.name)}" alt="Avatar" class="${size} rounded-full border-4 ${border} mb-2">
                    <span class="font-bold">${Utils.escapeHtml(u.name)}</span>
                    <span class="text-green-400 font-bold">${u.points} pts</span>
                    <span class="text-2xl font-bold ${rank === 1 ? 'text-yellow-400' : (rank === 2 ? 'text-gray-300' : 'text-amber-600')}">
                        <i class="fas ${medal}"></i> #${rank}
                    </span>
                </div>
            `;
        }).join('');
    },

    /**
     * Render last 3 users in a row with circles
     */
    renderLast3(users) {
        const box = document.getElementById("last3");
        if (!box) return;

        // Show in order: worst, bad, less bad
        const sorted = [users[2], users[1], users[0]].filter(Boolean);

        box.innerHTML = sorted.map((u, i) => {
            const rank = 4 + i; // 4, 5, 6
            return `
                <div class="flex flex-col items-center">
                    <i class="fas fa-bug text-2xl text-red-400 mb-1"></i>
                    <img src="${this.getAvatar(u.name)}" alt="Avatar" class="w-14 h-14 rounded-full border-4 border-red-500 mb-2">
                    <span class="font-bold">${Utils.escapeHtml(u.name)}</span>
                    <span class="text-red-400 font-bold">${u.points} pts</span>
                    <span class="text-lg text-red-400"><i class="fas fa-skull"></i> #${rank}</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Render full leaderboard list
     */
    renderAll(users) {
        const box = document.getElementById("leaderboard");
        if (!box) return;

        const sorted = [...users].sort((a, b) => b.points - a.points);

        box.innerHTML = sorted.map((u, i) => `
            <div class="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 w-6">${i + 1}.</span>
                    <img src="${this.getAvatar(u.name)}" alt="Avatar" class="w-8 h-8 rounded-full border-2 border-gray-500">
                    <span>${Utils.escapeHtml(u.name)}</span>
                </div>
                <span class="text-green-400 font-bold">${u.points}</span>
            </div>
        `).join('');
    },

    /**
     * Load current user info
     */
    async loadUserBox(user) {
        const data = await db.getUserById(user.id);
        if (!data) return;

        const userBox = document.getElementById("userBox");
        const userName = document.getElementById("userName");
        const userScore = document.getElementById("userScore");
        const userAvatar = document.getElementById("userAvatar");

        if (userBox && userName && userScore && userAvatar) {
            userBox.classList.remove("hidden");
            userName.textContent = data.name;
            userScore.textContent = data.points;
            userAvatar.src = this.getAvatar(data.name);
        }
    }
};

window.Leaderboard = Leaderboard;