console.log("settings.js loaded");

/* ================= CONSTANTS ================= */
const APP_VERSION = "1.0.0";
const SETTINGS_KEY = "settings";

/* ================= HELPERS ================= */
function getSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("plannerDataChanged"));
}

/* ================= APPLY THEME ================= */
function applyTheme() {
    const settings = getSettings();
    document.body.classList.toggle("dark", settings.theme === "dark");
}

/* ================= TOGGLE THEME ================= */
const toggleThemeBtn = document.getElementById("toggleTheme");
toggleThemeBtn?.addEventListener("click", () => {
    const settings = getSettings();
    settings.theme = settings.theme === "dark" ? "light" : "dark";
    saveSettings(settings);
    applyTheme();
});

/* ================= DAILY RESET CHECK ================= */
function checkDailyReset() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("lastVisitDate");

    if (lastVisit !== today) {
        localStorage.setItem("lastVisitDate", today);
    }
}

/* ================= EXPORT DATA ================= */
const exportBtn = document.getElementById("exportData");
exportBtn?.addEventListener("click", () => {
    const payload = {
        meta: {
            exportedAt: new Date().toISOString(),
            appVersion: APP_VERSION
        },
        data: {
            subjects: JSON.parse(localStorage.getItem("subjects")) || [],
            schedules: JSON.parse(localStorage.getItem("schedules")) || [],
            tasks: JSON.parse(localStorage.getItem("tasks")) || [],
            settings: getSettings()
        }
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart-study-planner-backup.json";
    a.click();
    URL.revokeObjectURL(url);
});

/* ================= RESET ALL DATA ================= */
const resetBtn = document.getElementById("resetData");
resetBtn?.addEventListener("click", () => {
    const confirmReset = confirm(
        "This will delete all planner data.\nThis action cannot be undone.\n\nProceed?"
    );

    if (!confirmReset) return;

    [
        "subjects",
        "tasks",
        "schedules",
        "settings",
        "lastVisitDate"
    ].forEach(key => localStorage.removeItem(key));

    location.reload();
});

/* ================= INIT ================= */
applyTheme();
checkDailyReset();
