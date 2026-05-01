// filepath: js/vote.js
// =====================================================
// VOTE - Voting system functions
// =====================================================

const Vote = {
    /**
     * Load all users into the dropdown
     */
    async loadUsers() {
        const users = await db.getUsers();
        const select = Utils.$("targetUser");

        if (!select || !users) return;

        select.innerHTML = '<option value="">اختر اللاعب المستهدف...</option>';

        users.forEach(u => {
            select.innerHTML += `<option value="${u.id}">${Utils.escapeHtml(u.name)}</option>`;
        });
    },

    /**
     * Create a new vote
     */
    async createVote() {
        const user = await db.getUser();

        if (!user) {
            Utils.showMsg("الرجاء تسجيل الدخول أولاً", "red");
            return;
        }

        const titleInput = Utils.$("title");
        const fileInput = Utils.$("file");
        const targetUserSelect = Utils.$("targetUser");
        const durationInput = Utils.$("voteDuration");

        const title = titleInput?.value;
        const file = fileInput?.files[0];
        const targetUserId = targetUserSelect?.value;
        const duration = parseInt(durationInput?.value) || 10;

        if (!title || !file || !targetUserId) {
            Utils.showMsg("الرجاء ملء جميع الحقول واختيار اللاعب المستهدف", "yellow");
            return;
        }

        // Validate duration (1 minute to 24 hours)
        if (duration < 1 || duration > 1440) {
            Utils.showMsg("مدة التصويت يجب أن تكون بين 1 دقيقة و 24 ساعة", "yellow");
            return;
        }

        const voteId = crypto.randomUUID();
        const path = `votes/${voteId}/${file.name}`;

        // Upload image
        const { error: uploadError } = await db.instance.storage
            .from("images")
            .upload(path, file);

        if (uploadError) {
            Utils.showMsg("فشل الرفع: " + uploadError.message, "red");
            return;
        }

        // Calculate end time based on duration in minutes
        const endTime = new Date(Date.now() + (duration * 60000));

        // Insert vote
        const { error } = await db.instance
            .from("votes")
            .insert({
                id: voteId,
                title,
                image_path: path,
                created_by: user.id,
                target_user_id: targetUserId,
                end_time: endTime,
                is_deleted: false
            });

        if (error) {
            Utils.showMsg("خطأ: " + error.message, "red");
            return;
        }

        Utils.showMsg("تم إنشاء التصويت بنجاح!", "green");
        Utils.vibrate(100);
        titleInput.value = "";
        fileInput.value = "";
        targetUserSelect.value = "";
        durationInput.value = "10";
        await this.load();
    },

    /**
     * Get user's vote for a specific vote
     */
    async getUserVote(voteId, userId) {
        if (!userId) return null;

        const { data } = await db.instance
            .from("user_votes")
            .select("choice")
            .eq("vote_id", voteId)
            .eq("user_id", userId)
            .single();

        return data?.choice || null;
    },

    /**
     * Load and render all votes
     */
    async load() {
        const { data: votes } = await db.instance
            .from("votes")
            .select("*, target_user:target_user_id(name)")
            .eq("is_deleted", false)
            .order("created_at", { ascending: false });

        const container = Utils.$("votes");
        if (!container) return;

        container.innerHTML = "";

        if (!votes || votes.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400">لا توجد تصويتات حتى الآن</p>';
            return;
        }

        const user = await db.getUser();

        for (const v of votes) {
            // Check if vote has ended and process it
            const now = new Date();
            const endTime = v.end_time ? new Date(v.end_time + 'Z') : null;
            const hasEnded = endTime ? endTime < now : false;

            if (hasEnded) {
                // Award points and delete vote
                await this.processEndedVote(v.id, v.target_user_id);
                continue; // Skip rendering this vote
            }

            const url = db.instance.storage
                .from("images")
                .getPublicUrl(v.image_path).data.publicUrl;

            const withCount = await this.getCount(v.id, 'with');
            const againstCount = await this.getCount(v.id, 'against');
            const totalVotes = withCount + againstCount;
            const targetUserName = v.target_user?.name || 'غير معروف';

            // Calculate percentages
            const withPercent = totalVotes > 0 ? Math.round((withCount / totalVotes) * 100) : 50;
            const againstPercent = totalVotes > 0 ? Math.round((againstCount / totalVotes) * 100) : 50;

            // Check user's vote
            const userVote = await this.getUserVote(v.id, user?.id);

            // Generate unique ID for timer
            const timerId = `timer-${v.id}`;

            container.innerHTML += `
                <div class="bg-white/10 p-4 rounded-xl max-w-md mx-auto">
                    <img src="${url}" class="rounded mb-3 w-full h-96 object-cover" alt="${Utils.escapeHtml(v.title)}">
                    <h2 class="text-lg mb-2 font-bold">${Utils.escapeHtml(v.title)}</h2>
                    <p class="text-sm text-blue-400 mb-3">
                        <i class="fas fa-user"></i> اللاعب المستهدف: ${Utils.escapeHtml(targetUserName)}
                    </p>
                    
                    ${userVote ? `
                        <div class="bg-purple-700/50 p-3 rounded mb-3 border-2 border-pink-400">
                            <p class="text-center text-white font-bold">
                                <i class="fas fa-heart text-pink-400 animate-pulse"></i> لقد صوّت بـ: 
                                ${userVote === 'with' ?
                        '<span class="text-green-400">بونط <i class="fas fa-thumbs-up"></i></span>' :
                        '<span class="text-red-400">احبنه <i class="fas fa-thumbs-down"></i></span>'
                    }
                            </p>
                        </div>
                    ` : `
                        <div class="flex gap-2 mb-3">
                            <button onclick="Vote.cast('${v.id}', 'with')" class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition transform hover:scale-105">
                                بونط <i class="fas fa-thumbs-up"></i>
                            </button>
                            <button onclick="Vote.cast('${v.id}', 'against')" class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition transform hover:scale-105">
                                احبنه <i class="fas fa-thumbs-down"></i>
                            </button>
                        </div>
                    `}
                    
                    <p class="text-center text-lg font-bold text-yellow-400 mb-2">
                        <i class="fas fa-hourglass-half"></i> <span id="${timerId}">--:--</span>
                    </p>
                    
                    <!-- Progress Bar -->
                    <div class="mb-3">
                        <div class="flex h-8 rounded-full overflow-hidden border-2 border-gray-600">
                            <div class="bg-green-600 flex items-center justify-center text-white font-bold text-sm transition-all duration-500" style="width: ${withPercent}%">
                                ${withPercent > 15 ? withPercent + '%' : ''}
                            </div>
                            <div class="bg-red-600 flex items-center justify-center text-white font-bold text-sm transition-all duration-500" style="width: ${againstPercent}%">
                                ${againstPercent > 15 ? againstPercent + '%' : ''}
                            </div>
                        </div>
                        <div class="flex justify-between mt-1 text-xs text-gray-400">
                            <span>بونط</span>
                            <span>احبنه</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-between text-sm text-gray-300">
                        <p class="text-green-400"><i class="fas fa-thumbs-up"></i> بونط: ${withCount}</p>
                        <p class="text-red-400"><i class="fas fa-thumbs-down"></i> احبنه: ${againstCount}</p>
                    </div>
                </div>
            `;

            // Start countdown timer
            this.startTimer(timerId, endTime);
        }
    },

    /**
     * Start countdown timer for a vote
     */
    startTimer(timerId, endTime) {
        const updateTimer = () => {
            const timerElement = document.getElementById(timerId);
            if (!timerElement) return;

            const now = new Date();
            const diff = endTime - now;

            if (diff <= 0) {
                timerElement.textContent = "انتهى!";
                timerElement.parentElement.classList.remove('text-yellow-400');
                timerElement.parentElement.classList.add('text-red-500', 'animate-pulse');
                // Reload to process ended vote
                setTimeout(() => this.load(), 1000);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Change color when less than 1 minute
            if (minutes === 0) {
                timerElement.parentElement.classList.remove('text-yellow-400');
                timerElement.parentElement.classList.add('text-red-500');
            }

            setTimeout(updateTimer, 1000);
        };

        updateTimer();
    },

    /**
     * Process ended vote: award points and delete
     */
    async processEndedVote(voteId, targetUserId) {
        console.log("Processing ended vote:", voteId);

        const withCount = await this.getCount(voteId, 'with');
        const againstCount = await this.getCount(voteId, 'against');

        console.log("With:", withCount, "Against:", againstCount);

        // Award point if "with" wins
        if (withCount > againstCount && targetUserId) {
            const { data: targetUser } = await db.instance
                .from("users")
                .select("points, name")
                .eq("id", targetUserId)
                .single();

            if (targetUser) {
                await db.instance
                    .from("users")
                    .update({ points: targetUser.points + 1 })
                    .eq("id", targetUserId);

                console.log("Awarded point to " + targetUser.name);
                Utils.showMsg("تم منح نقطة لـ " + targetUser.name + "!", "green");
            }
        }

        // Delete user votes first (foreign key constraint)
        await db.instance
            .from("user_votes")
            .delete()
            .eq("vote_id", voteId);

        // Mark vote as deleted
        await db.instance
            .from("votes")
            .update({ is_deleted: true })
            .eq("id", voteId);

        console.log("Vote deleted:", voteId);
    },

    /**
     * Cast a vote
     */
    async cast(voteId, choice) {
        const user = await db.getUser();
        if (!user) {
            Utils.showMsg("الرجاء تسجيل الدخول أولاً", "red");
            return;
        }

        // Check if vote has ended
        const { data: vote } = await db.instance
            .from("votes")
            .select("end_time")
            .eq("id", voteId)
            .single();

        if (vote && new Date(vote.end_time + 'Z') < new Date()) {
            Utils.showMsg("انتهى وقت التصويت!", "red");
            await this.load();
            return;
        }

        const { error } = await db.instance
            .from("user_votes")
            .insert({
                user_id: user.id,
                vote_id: voteId,
                choice: choice
            });

        if (error) {
            Utils.showMsg("لقد صوّت بالفعل!", "yellow");
            return;
        }

        const choiceText = choice === 'with' ? 'بونط' : 'احبنه';
        Utils.showMsg("تم التصويت بـ " + choiceText + " بنجاح!", "green");
        Utils.vibrate(50);
        await this.load();
    },

    /**
     * Get vote count
     */
    async getCount(voteId, choice = null) {
        let query = db.instance
            .from("user_votes")
            .select("*")
            .eq("vote_id", voteId);

        if (choice) {
            query = query.eq("choice", choice);
        }

        const { data } = await query;

        return data ? data.length : 0;
    }
};

window.Vote = Vote;
