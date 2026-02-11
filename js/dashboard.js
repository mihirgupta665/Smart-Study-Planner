console.log("dashboard.js loaded");

/* ================= HELPERS ================= */
function getStorage(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function toDateString(date) {
    return new Date(date).toDateString();
}

/* ================= MAIN RENDER ================= */
function renderDashboard() {
    const tasks = getStorage("tasks");
    const schedules = getStorage("schedules");

    renderStudyStreak(tasks);
    renderWeeklyConsistency(tasks);
    renderStudyTimeToday(schedules);
}

/* ================= STUDY STREAK ================= */
function renderStudyStreak(tasks) {
    const streakEl = document.getElementById("studyStreak");
    if (!streakEl) return;

    const completedDates = new Set(
        tasks
            .filter(t => t.status === "Completed")
            .map(t => toDateString(t.completedAt || t.deadline))
    );

    let streak = 0;
    let current = new Date();

    while (completedDates.has(current.toDateString())) {
        streak++;
        current.setDate(current.getDate() - 1);
    }

    streakEl.textContent = streak;
}

function renderWeeklyConsistency(tasks) {
    const bar = document.getElementById("weeklyConsistency");
    if (!bar) return;

    bar.innerHTML = "";

    const today = new Date();
    const completedByDay = {};

    tasks
        .filter(t => t.status === "Completed")
        .forEach(t => {
            const date = toDateString(t.completedAt || t.deadline);
            completedByDay[date] = true;
        });

    // Generate from 0 → 6 instead of 6 → 0
    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - i));

        const span = document.createElement("span");

        if (completedByDay[day.toDateString()]) {
            span.classList.add("active");
        }

        span.title = day.toLocaleDateString("en-US", { weekday: "short" });
        bar.appendChild(span);
    }
}


/* ================= STUDY TIME TODAY ================= */
function renderStudyTimeToday(schedules) {
    const el = document.getElementById("todayStudyTime");
    if (!el) return;

    const todayName = new Date().toLocaleDateString("en-US", {
        weekday: "long"
    });

    const todaySchedules = schedules.filter(s => s.day === todayName);

    let totalMinutes = 0;

    todaySchedules.forEach(s => {
        if (!s.start || !s.end) return;
        const [sh, sm] = s.start.split(":").map(Number);
        const [eh, em] = s.end.split(":").map(Number);
        totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    });

    el.textContent = `${(totalMinutes / 60).toFixed(1)} hrs`;
}

/* ================= GLOBAL LISTENERS ================= */
window.addEventListener("plannerDataChanged", renderDashboard);
window.addEventListener("storage", renderDashboard);

/* ================= INIT ================= */
renderDashboard();
