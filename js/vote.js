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
        console.log("createVote called");

        const user = await db.getUser();
        console.log("User:", user);

        if (!user) {
            Utils.showMsg("الرجاء تسجيل الدخول أولاً", "red");
            return;
        }

        const titleInput = Utils.$("title");
        const fileInput = Utils.$("file");
        const targetUserSelect = Utils.$("targetUser");

        console.log("Title input:", titleInput);
        console.log("File input:", fileInput);
        console.log("Target user select:", targetUserSelect);

        const title = titleInput?.value;
        const file = fileInput?.files[0];
        const targetUserId = targetUserSelect?.value;

        console.log("Title:", title);
        console.log("File:", file);
        console.log("Target User ID:", targetUserId);

        if (!title || !file || !targetUserId) {
            Utils.showMsg("الرجاء ملء جميع الحقول واختيار اللاعب المستهدف", "red");
            return;
        }

        const voteId = crypto.randomUUID();
        const path = `votes/${voteId}/${file.name}`;

        console.log("Uploading to:", path);

        // Upload image
        const { error: uploadError } = await db.instance.storage
            .from("images")
            .upload(path, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            Utils.showMsg("فشل الرفع: " + uploadError.message, "red");
            return;
        }

        console.log("Upload successful, inserting vote...");

        // Insert vote
        const { error } = await db.instance
            .from("votes")
            .insert({
                id: voteId,
                title,
                image_path: path,
                created_by: user.id,
                target_user_id: targetUserId,
                end_time: new Date(Date.now() + 600000), // 10 minutes
                is_deleted: false
            });

        if (error) {
            console.error("Insert error:", error);
            Utils.showMsg("خطأ: " + error.message, "red");
            return;
        }

        console.log("Vote created successfully!");
        Utils.showMsg("تم إنشاء التصويت بنجاح!", "green");
        Utils.vibrate(100);
        titleInput.value = "";
        fileInput.value = "";
        targetUserSelect.value = "";
        await this.load();
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

        for (const v of votes) {
            const url = db.instance.storage
                .from("images")
                .getPublicUrl(v.image_path).data.publicUrl;

            const withCount = await this.getCount(v.id, 'with');
            const againstCount = await this.getCount(v.id, 'against');
            const totalVotes = withCount + againstCount;
            const targetUserName = v.target_user?.name || 'غير معروف';

            // Check if voting has ended
            const hasEnded = new Date(v.end_time) < new Date();
            const timeLeft = this.getTimeLeft(v.end_time);

            container.innerHTML += `
                <div class="bg-white/10 p-4 rounded-xl max-w-md mx-auto">
                    <img src="${url}" class="rounded mb-3 w-full h-96 object-cover" alt="${Utils.escapeHtml(v.title)}">
                    <h2 class="text-lg mb-2 font-bold">${Utils.escapeHtml(v.title)}</h2>
                    <p class="text-sm text-blue-400 mb-3">
                        <i class="fas fa-user"></i> اللاعب المستهدف: ${Utils.escapeHtml(targetUserName)}
                    </p>
                    
                    ${hasEnded ? `
                        <div class="bg-gray-700 p-3 rounded mb-3">
                            <p class="text-center text-yellow-400 font-bold">
                                <i class="fas fa-clock"></i> انتهى التصويت
                            </p>
                            ${totalVotes > 0 ? `
                                <p class="text-center mt-2">
                                    ${withCount > againstCount ?
                            '<span class="text-green-400">✓ فاز "بونط"</span>' :
                            withCount < againstCount ?
                                '<span class="text-red-400">✓ فاز "احبنه"</span>' :
                                '<span class="text-gray-400">تعادل</span>'
                        }
                                </p>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="flex gap-2 mb-3">
                            <button onclick="Vote.cast('${v.id}', 'with')" class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition">
                                بونط <i class="fas fa-thumbs-up"></i>
                            </button>
                            <button onclick="Vote.cast('${v.id}', 'against')" class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">
                                احبنه <i class="fas fa-thumbs-down"></i>
                            </button>
                        </div>
                        <p class="text-center text-sm text-gray-400 mb-2">
                            <i class="fas fa-hourglass-half"></i> ${timeLeft}
                        </p>
                    `}
                    
                    <div class="flex justify-between text-sm text-gray-300">
                        <p class="text-green-400">بونط: ${withCount}</p>
                        <p class="text-red-400">احبنه: ${againstCount}</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Get time left for voting
     */
    getTimeLeft(endTime) {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return "انتهى";

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')} متبقي`;
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

        if (vote && new Date(vote.end_time) < new Date()) {
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
            Utils.showMsg("لقد صوّت بالفعل!", "red");
            return;
        }

        Utils.showMsg("تم التصويت بنجاح!", "green");
        Utils.vibrate(50);
        await this.load();
    },

    /**
     * Check and award points for ended votes
     */
    async checkAndAwardPoints(voteId) {
        const { data: vote } = await db.instance
            .from("votes")
            .select("*")
            .eq("id", voteId)
            .single();

        if (!vote || !vote.target_user_id) return;

        // Check if vote has ended
        if (new Date(vote.end_time) > new Date()) return;

        const withCount = await this.getCount(voteId, 'with');
        const againstCount = await this.getCount(voteId, 'against');

        // Award point if "with" wins
        if (withCount > againstCount) {
            const { data: targetUser } = await db.instance
                .from("users")
                .select("points")
                .eq("id", vote.target_user_id)
                .single();

            if (targetUser) {
                await db.instance
                    .from("users")
                    .update({ points: targetUser.points + 1 })
                    .eq("id", vote.target_user_id);
            }
        }
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