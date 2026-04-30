// filepath: js/config.js
// =====================================================
// CONFIG - Shared configuration for all pages
// =====================================================

const CONFIG = {
    SUPABASE_URL: "https://pfjknmkpfpnlrqjiwkan.supabase.co",
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamtubWtwZnBubHJxaml3a2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzY1ODUsImV4cCI6MjA5MDY1MjU4NX0.MivoUcReqSyKgecIhvQX3UTQswO52xzDXnMqoHCH6AA",

    // Page routes
    PAGES: {
        LOGIN: "login.html",
        SIGNUP: "sign-up.html",
        INDEX: "index.html"
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;