// filepath: js/supabase.js
// =====================================================
// SUPABASE CLIENT - Single instance wrapper
// =====================================================

class SupabaseClient {
    constructor() {
        this._client = null;
    }

    get instance() {
        if (!this._client) {
            this._client = supabase.createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_KEY
            );
        }
        return this._client;
    }

    // Auth helpers
    async getUser() {
        const { data } = await this.instance.auth.getUser();
        return data?.user || null;
    }

    async signInWithPassword(email, password) {
        return await this.instance.auth.signInWithPassword({ email, password });
    }

    async signUp(email, password) {
        return await this.instance.auth.signUp({ email, password });
    }

    async signOut() {
        return await this.instance.auth.signOut();
    }

    // Database helpers
    async getUsers() {
        const { data } = await this.instance
            .from('users')
            .select('*')
            .order('points', { ascending: false });
        return data || [];
    }

    async getUserById(userId) {
        const { data } = await this.instance
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return data;
    }

    async createUser(userData) {
        return await this.instance
            .from('users')
            .insert(userData);
    }
}

// Singleton instance
const db = new SupabaseClient();
window.db = db;