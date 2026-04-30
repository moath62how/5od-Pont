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

        // Sort: 2nd left, 1st middle, 3rd right
        const sorted = [users[1], users[0], users[2]].filter(Boolean);

        box.innerHTML = sorted.map((u, i) => {
            const isFirst = i === 1;
            const rank = i === 1 ? 1 : (i === 0 ? 2 : 3);
            const size = isFirst ? 'w-32 h-32' : 'w-24 h-24';
            const border = rank === 1 ? 'border-yellow-400 shadow-2xl shadow-yellow-400/60' : (rank === 2 ? 'border-gray-300 shadow-xl shadow-gray-300/40' : 'border-amber-600 shadow-lg shadow-amber-600/40');
            const medal = rank === 1 ? 'fa-crown text-yellow-400' : (rank === 2 ? 'fa-medal text-gray-300' : 'fa-medal text-amber-600');
            const bgGlow = rank === 1 ? 'bg-gradient-to-b from-yellow-400/20 to-transparent' : (rank === 2 ? 'bg-gradient-to-b from-gray-300/20 to-transparent' : 'bg-gradient-to-b from-amber-600/20 to-transparent');

            return `
                <div class="flex flex-col items-center ${isFirst ? 'mt-0' : 'mt-8'} relative">
                    <div class="absolute inset-0 ${bgGlow} rounded-3xl blur-xl -z-10"></div>
                    ${rank === 1 ? '<i class="fas fa-crown text-4xl text-yellow-400 mb-2 animate-pulse"></i>' : ''}
                    ${rank === 2 ? '<i class="fas fa-star text-2xl text-gray-300 mb-2"></i>' : ''}
                    ${rank === 3 ? '<i class="fas fa-star text-xl text-amber-600 mb-2"></i>' : ''}
                    <div class="relative">
                        ${rank === 1 ? `
                            <!-- Fire icons around the frame -->
                            <i class="fas fa-fire absolute -top-2 -left-2 text-orange-500 text-xl animate-pulse"></i>
                            <i class="fas fa-fire absolute -top-2 -right-2 text-red-500 text-xl animate-pulse" style="animation-delay: 0.3s;"></i>
                            <i class="fas fa-fire absolute -bottom-2 -left-2 text-red-500 text-xl animate-pulse" style="animation-delay: 0.6s;"></i>
                            <i class="fas fa-fire absolute -bottom-2 -right-2 text-orange-500 text-xl animate-pulse" style="animation-delay: 0.9s;"></i>
                            <i class="fas fa-fire absolute top-1/2 -left-3 text-yellow-500 text-lg animate-pulse transform -translate-y-1/2" style="animation-delay: 0.15s;"></i>
                            <i class="fas fa-fire absolute top-1/2 -right-3 text-yellow-500 text-lg animate-pulse transform -translate-y-1/2" style="animation-delay: 0.45s;"></i>
                            <i class="fas fa-fire absolute -top-3 left-1/2 text-orange-400 text-lg animate-pulse transform -translate-x-1/2" style="animation-delay: 0.75s;"></i>
                            <i class="fas fa-fire absolute -bottom-3 left-1/2 text-red-400 text-lg animate-pulse transform -translate-x-1/2" style="animation-delay: 1.05s;"></i>
                        ` : ''}
                        <img src="${this.getAvatar(u.name)}" alt="صورة" class="${size} rounded-full border-4 ${border}">
                    </div>
                    <span class="font-bold text-lg mt-3">${Utils.escapeHtml(u.name)}</span>
                    <span class="text-green-400 font-bold text-xl">${u.points} نقطة</span>
                    <span class="text-2xl font-bold mt-1 ${rank === 1 ? 'text-yellow-400' : (rank === 2 ? 'text-gray-300' : 'text-amber-600')}">
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
        const sorted = [users[0], users[1], users[2]].filter(Boolean);

        box.innerHTML = sorted.map((u, i) => {
            const isWorst = i === 0;
            const size = isWorst ? 'w-24 h-24' : 'w-20 h-20';
            const eggSize = isWorst ? 'text-lg' : 'text-base';
            const bgGlow = 'bg-gradient-to-b from-red-500/20 to-transparent';

            return `
                <div class="flex flex-col items-center ${isWorst ? 'mt-0' : 'mt-4'} relative">
                    <div class="absolute inset-0 ${bgGlow} rounded-3xl blur-xl -z-10"></div>
                    ${isWorst ? '<i class="fas fa-skull-crossbones text-3xl text-red-400 mb-2 animate-pulse"></i>' : '<i class="fas fa-skull text-2xl text-red-400 mb-2"></i>'}
                    <div class="relative">
                        <!-- Egg icons around the frame -->
                        <i class="fas fa-egg absolute -top-2 -left-2 text-yellow-200 ${eggSize} transform -rotate-12"></i>
                        <i class="fas fa-egg absolute -top-2 -right-2 text-yellow-200 ${eggSize} transform rotate-12"></i>
                        <i class="fas fa-egg absolute -bottom-2 -left-2 text-yellow-200 ${eggSize} transform rotate-12"></i>
                        <i class="fas fa-egg absolute -bottom-2 -right-2 text-yellow-200 ${eggSize} transform -rotate-12"></i>
                        ${isWorst ? `
                            <i class="fas fa-egg absolute top-1/2 -left-3 text-yellow-200 text-sm transform -translate-y-1/2 -rotate-45"></i>
                            <i class="fas fa-egg absolute top-1/2 -right-3 text-yellow-200 text-sm transform -translate-y-1/2 rotate-45"></i>
                        ` : ''}
                        <img src="${this.getAvatar(u.name)}" alt="صورة" class="${size} rounded-full border-4 border-red-500 shadow-xl shadow-red-500/50">
                    </div>
                    <span class="font-bold text-lg mt-3">${Utils.escapeHtml(u.name)}</span>
                    <span class="text-red-400 font-bold text-xl">${u.points} نقطة</span>
                    <span class="text-lg text-red-400 mt-1">
                        <i class="fas fa-thumbs-down"></i> ${isWorst ? 'الأسوأ' : 'ضعيف'}
                    </span>
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
            <div class="bg-white/10 p-3 rounded-xl flex justify-between items-center hover:bg-white/20 transition">
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 w-6">${i + 1}.</span>
                    <img src="${this.getAvatar(u.name)}" alt="صورة" class="w-8 h-8 rounded-full border-2 border-gray-500">
                    <span>${Utils.escapeHtml(u.name)}</span>
                </div>
                <span class="text-green-400 font-bold">${u.points} بونط</span>
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