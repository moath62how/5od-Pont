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

            const count = await this.getCount(v.id);

            container.innerHTML += `
                <div class="bg-white/10 p-4 rounded-xl">
                    <img src="${url}" class="rounded mb-2 w-full h-48 object-cover" alt="${Utils.escapeHtml(v.title)}">
                    <h2 class="text-lg mb-2">${Utils.escapeHtml(v.title)}</h2>
                    <button onclick="Vote.cast('${v.id}')" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition">
                        تصويت <i class="fas fa-heart"></i>
                    </button>
                    <p class="mt-2 text-sm text-gray-300">عدد الأصوات: ${count}</p>
                </div>
            `;
        }
    },

    /**
     * Cast a vote
     */
    async cast(voteId) {
        const user = await db.getUser();
        if (!user) {
            Utils.showMsg("الرجاء تسجيل الدخول أولاً", "red");
            return;
        }

        const { error } = await db.instance
            .from("user_votes")
            .insert({
                user_id: user.id,
                vote_id: voteId
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
    async getCount(voteId) {
        const { data } = await db.instance
            .from("user_votes")
            .select("*")
            .eq("vote_id", voteId);

        return data ? data.length : 0;
    }
};

window.Vote = Vote;