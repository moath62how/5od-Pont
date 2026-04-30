// filepath: js/vote.js
// =====================================================
// VOTE - Voting system functions
// =====================================================

const Vote = {
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

        console.log("Title input:", titleInput);
        console.log("File input:", fileInput);

        const title = titleInput?.value;
        const file = fileInput?.files[0];

        console.log("Title:", title);
        console.log("File:", file);

        if (!title || !file) {
            Utils.showMsg("الرجاء ملء جميع الحقول", "red");
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
                end_time: new Date(Date.now() + 600000),
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
        await this.load();
    },

    /**
     * Load and render all votes
     */
    async load() {
        const { data: votes } = await db.instance
            .from("votes")
            .select("*")
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

            container.innerHTML += `
                <div class="bg-white/10 p-4 rounded-xl max-w-md mx-auto">
                    <img src="${url}" class="rounded mb-3 w-full h-96 object-cover" alt="${Utils.escapeHtml(v.title)}">
                    <h2 class="text-lg mb-3 font-bold">${Utils.escapeHtml(v.title)}</h2>
                    
                    <div class="flex gap-2 mb-3">
                        <button onclick="Vote.cast('${v.id}', 'with')" class="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition">
                            بونط <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button onclick="Vote.cast('${v.id}', 'against')" class="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">
                            احبنه <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                    
                    <div class="flex justify-between text-sm text-gray-300">
                        <p class="text-green-400">بونط: ${withCount}</p>
                        <p class="text-red-400">احبنه: ${againstCount}</p>
                    </div>
                </div>
            `;
        }
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