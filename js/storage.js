console.log("storage.js loaded");

/* ================= CONSTANTS ================= */
const ACTIVE_TAB_KEY = "activeTab";

/* ================= SAFE STORAGE UTILS ================= */
function getStorage(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChange();
}

/* ================= GLOBAL DATA CHANGE EVENT ================= */
function notifyDataChange() {
    window.dispatchEvent(new Event("plannerDataChanged"));
}

/* ================= NAVIGATION ================= */
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".section");

    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    function activateSection(targetId) {
        sections.forEach(section => section.classList.remove("active"));
        navItems.forEach(nav => nav.classList.remove("active"));

        const section = document.getElementById(targetId);
        const navItem = document.querySelector(`[data-target="${targetId}"]`);

        if (section) section.classList.add("active");
        if (navItem) navItem.classList.add("active");

        localStorage.setItem(ACTIVE_TAB_KEY, targetId);
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");
            if (!targetId) return;

            activateSection(targetId);

            if (navLinks) navLinks.classList.remove("show");
        });
    });

    // Restore last active tab
    const lastTab = localStorage.getItem(ACTIVE_TAB_KEY) || "dashboard";
    activateSection(lastTab);

    // Mobile nav toggle
    navToggle?.addEventListener("click", () => {
        navLinks?.classList.toggle("show");
    });
});

/* ================= STORAGE SYNC ================= */
window.addEventListener("storage", () => {
    notifyDataChange();
});
