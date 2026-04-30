// filepath: js/vote.js
// =====================================================
// VOTE - Voting system functions
// =====================================================

const Vote = {
    /**
     * Create a new vote
     */
    async createVote() {
        const user = await db.getUser();
        if (!user) {
            Utils.showMsg("Please login first", "red");
            return;
        }

        const title = Utils.$("title").value;
        const file = Utils.$("file").files[0];

        if (!title || !file) {
            Utils.showMsg("Fill all fields", "red");
            return;
        }

        const voteId = crypto.randomUUID();
        const path = `votes/${voteId}/${file.name}`;

        // Upload image
        const { error: uploadError } = await db.instance.storage
            .from("images")
            .upload(path, file);

        if (uploadError) {
            Utils.showMsg("Upload failed: " + uploadError.message, "red");
            return;
        }

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
            Utils.showMsg("Error: " + error.message, "red");
            return;
        }

        Utils.vibrate(100);
        Utils.$("title").value = "";
        Utils.$("file").value = "";
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
            container.innerHTML = '<p class="text-center text-gray-400">No votes yet</p>';
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
                    <button onclick="Vote.cast('${v.id}')" class="bg-green-600 hover:bg-green-700 px-4 py-1 rounded transition">
                        Vote <i class="fas fa-heart"></i>
                    </button>
                    <p class="mt-2 text-sm text-gray-300">Votes: ${count}</p>
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
            Utils.showMsg("Please login first", "red");
            return;
        }

        const { error } = await db.instance
            .from("user_votes")
            .insert({
                user_id: user.id,
                vote_id: voteId
            });

        if (error) {
            Utils.showMsg("Already voted!", "red");
            return;
        }

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