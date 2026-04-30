// filepath: js/utils.js
// =====================================================
// UTILS - Utility functions
// =====================================================

const Utils = {
    /**
     * Show message to user
     */
    showMsg(text, color = "red") {
        const msg = document.getElementById("msg");
        if (!msg) return;

        msg.innerHTML = text;
        msg.className = `text-${color}-400 text-center mt-4 text-sm`;
    },

    /**
     * Vibrate device if supported
     */
    vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Redirect after delay
     */
    redirectTo(url, delay = 1000) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    },

    /**
     * Get element by id shorthand
     */
    $(id) {
        return document.getElementById(id);
    }
};

window.Utils = Utils;