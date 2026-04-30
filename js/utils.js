// filepath: js/utils.js
// =====================================================
// UTILS - Utility functions
// =====================================================

const Utils = {
    /**
     * Show message to user
     */
    showMsg(text, color = "red") {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.custom-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `custom-alert fixed top-4 left-4 z-50 px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out`;

        const bgColor = color === 'green' ? 'bg-green-600' : color === 'yellow' ? 'bg-yellow-600' : 'bg-red-600';
        alert.classList.add(bgColor);

        const icon = color === 'green' ? 'fa-check-circle' : color === 'yellow' ? 'fa-exclamation-circle' : 'fa-times-circle';

        alert.innerHTML = `
            <div class="flex items-center gap-3 text-white">
                <i class="fas ${icon} text-2xl"></i>
                <span class="font-bold">${text}</span>
            </div>
        `;

        document.body.appendChild(alert);

        // Animate in
        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.transform = 'translateX(-150%)';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
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