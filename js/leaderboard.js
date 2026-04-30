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
    },

    /**
     * Render top 3 users
     */
    renderTop3(users) {
        const box = document.getElementById("top3");
        if (!box) return;

        box.innerHTML = users.map((u, i) => `
            <div class="bg-white/10 p-3 rounded-xl flex justify-between">
                <span><i class="fas fa-medal text-yellow-400"></i> ${i + 1}. ${Utils.escapeHtml(u.name)}</span>
                <span class="text-green-400">${u.points}</span>
            </div>
        `).join('');
    },

    /**
     * Render last 3 users
     */
    renderLast3(users) {
        const box = document.getElementById("last3");
        if (!box) return;

        box.innerHTML = users.map((u) => `
            <div class="bg-white/5 p-3 rounded-xl flex justify-between">
                <span><i class="fas fa-exclamation-triangle text-red-400"></i> ${Utils.escapeHtml(u.name)}</span>
                <span class="text-red-400">${u.points}</span>
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
        const userEmail = document.getElementById("userEmail");
        const userScore = document.getElementById("userScore");

        if (userBox && userEmail && userScore) {
            userBox.classList.remove("hidden");
            userEmail.textContent = user.email;
            userScore.textContent = data.points;
        }
    }
};

window.Leaderboard = Leaderboard;