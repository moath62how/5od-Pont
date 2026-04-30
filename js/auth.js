// filepath: js/auth.js
// =====================================================
// AUTH - Authentication functions
// =====================================================

const Auth = {
    /**
     * Login with email and password
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error("أدخل البريد الإلكتروني وكلمة المرور");
        }

        const { data, error } = await db.signInWithPassword(email, password);

        if (error) {
            throw error;
        }

        Utils.vibrate(100);
        return data.user;
    },

    /**
     * Sign up new user
     */
    async signUp(name, email, password) {
        if (!name || !email || !password) {
            throw new Error("املأ جميع الحقول");
        }

        // 1. Create auth user
        const { data, error } = await db.signUp(email, password);

        if (error) {
            throw error;
        }

        const user = data.user;

        // 2. Insert into users table
        const { error: dbError } = await db.createUser({
            id: user.id,
            name,
            email,
            points: 0
        });

        if (dbError) {
            throw dbError;
        }

        Utils.vibrate([100, 50, 100]);
        return user;
    },

    /**
     * Check if user is logged in, redirect if not
     */
    async requireAuth() {
        const user = await db.getUser();
        if (!user) {
            window.location.href = CONFIG.PAGES.LOGIN;
            return null;
        }
        return user;
    },

    /**
     * Check if user is already logged in, redirect to index if so
     */
    async redirectIfAuth() {
        const user = await db.getUser();
        if (user) {
            window.location.href = CONFIG.PAGES.INDEX;
        }
    },

    /**
     * Logout and redirect
     */
    async logout() {
        await db.signOut();
        window.location.href = CONFIG.PAGES.LOGIN;
    }
};

window.Auth = Auth;