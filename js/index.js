// filepath: js/index.js
// =====================================================
// INDEX PAGE - Main leaderboard page functionality
// =====================================================

// Show login prompt modal
function showLoginPrompt() {
    document.getElementById('loginPromptModal').classList.remove('hidden');
}

// Close login prompt modal
function closeLoginPrompt() {
    document.getElementById('loginPromptModal').classList.add('hidden');
}

// Toggle profile dropdown
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('hidden');
}

// Open profile settings
function openProfileSettings() {
    window.location.href = 'profile.html';
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const menu = document.getElementById('userProfileMenu');
    const dropdown = document.getElementById('profileDropdown');
    if (menu && !menu.contains(event.target)) {
        dropdown?.classList.add('hidden');
    }
});

// Page-specific initialization
(async function init() {
    const user = await db.getUser();

    if (!user) {
        // Show login button
        document.getElementById('profileButton')?.classList.remove('hidden');
    } else {
        // Show user profile menu
        const userData = await db.getUserById(user.id);
        if (userData) {
            const profileMenu = document.getElementById('userProfileMenu');
            const headerAvatar = document.getElementById('headerAvatar');
            const dropdownName = document.getElementById('dropdownName');
            const dropdownPoints = document.getElementById('dropdownPoints');

            if (profileMenu) profileMenu.classList.remove('hidden');
            if (headerAvatar) headerAvatar.src = Leaderboard.getAvatar(userData.name, userData.profile_pic);
            if (dropdownName) dropdownName.textContent = userData.name;
            if (dropdownPoints) dropdownPoints.textContent = `${userData.points} نقطة`;
        }

        await Leaderboard.loadUserBox(user);
    }

    // Load leaderboard for everyone (logged in or not)
    await Leaderboard.load();

    // Hide loader
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
})();
