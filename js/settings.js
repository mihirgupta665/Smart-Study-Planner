
// Apply saved theme on load
function applyTheme() {
    const settings = JSON.parse(localStorage.getItem("settings")) || {};
    if (settings.theme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

// Toggle theme
document.getElementById("toggleTheme").addEventListener("click", () => {
    const settings = JSON.parse(localStorage.getItem("settings")) || {};
    const newTheme = settings.theme === "dark" ? "light" : "dark";

    localStorage.setItem("settings", JSON.stringify({ theme: newTheme }));
    applyTheme();
});

// Export data
document.getElementById("exportData").addEventListener("click", () => {
    const data = {
        subjects: JSON.parse(localStorage.getItem("subjects")) || [],
        schedules: JSON.parse(localStorage.getItem("schedules")) || [],
        tasks: JSON.parse(localStorage.getItem("tasks")) || [],
        settings: JSON.parse(localStorage.getItem("settings")) || {}
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart-study-planner-data.json";
    a.click();

    URL.revokeObjectURL(url);
});

// Reset all data
document.getElementById("resetData").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all data?")) {
        localStorage.clear();
        location.reload();
    }
});

// Initial setup
applyTheme();
