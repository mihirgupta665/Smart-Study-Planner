console.log("schedule.js loaded");

/* ================= ELEMENTS ================= */
const scheduleForm = document.getElementById("scheduleForm");
const scheduleList = document.getElementById("scheduleList");
const todayTimeline = document.getElementById("todayScheduleTimeline");
const freeTimeSlotsList = document.getElementById("freeTimeSlots");
const scheduleDaySelect = document.getElementById("scheduleDay");

/* ================= STORAGE ================= */
function getSchedules() {
    return JSON.parse(localStorage.getItem("schedules")) || [];
}

function saveSchedules(schedules) {
    localStorage.setItem("schedules", JSON.stringify(schedules));
    window.dispatchEvent(new Event("plannerDataChanged"));
}

/* ================= HELPERS ================= */
function getTodayName() {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ================= INIT DAYS ================= */
function initScheduleDays() {
    if (!scheduleDaySelect) return;

    const days = [
        "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday", "Sunday"
    ];

    scheduleDaySelect.innerHTML = "";
    days.forEach(day => {
        const opt = document.createElement("option");
        opt.value = day;
        opt.textContent = day;
        scheduleDaySelect.appendChild(opt);
    });
}

/* ================= CONFLICT CHECK ================= */
function hasConflict(newSchedule, schedules) {
    const newStart = timeToMinutes(newSchedule.start);
    const newEnd = timeToMinutes(newSchedule.end);

    return schedules.some(s => {
        if (s.day !== newSchedule.day) return false;

        const start = timeToMinutes(s.start);
        const end = timeToMinutes(s.end);

        return !(newEnd <= start || newStart >= end);
    });
}

/* ================= RENDER ALL SCHEDULES ================= */
function renderScheduleList() {
    if (!scheduleList) return;

    const schedules = getSchedules();
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    scheduleList.innerHTML = "";

    if (schedules.length === 0) {
        scheduleList.innerHTML = "<p>No schedules added yet.</p>";
        return;
    }

    schedules.forEach(s => {
        const subject = subjects.find(sub => sub.id == s.subjectId);

        const card = document.createElement("div");
        card.className = "card";
        card.style.marginTop = "10px";

        card.innerHTML = `
            <strong>${s.day}</strong><br/>
            ${s.start} - ${s.end}<br/>
            ${subject ? subject.name : "Unknown Subject"}
            <br/>
            <button onclick="deleteSchedule(${s.id})" style="margin-top:6px;">❌ Delete</button>
        `;

        scheduleList.appendChild(card);
    });
}

/* ================= TODAY TIMELINE ================= */
function renderTodaySchedule() {
    if (!todayTimeline) return;

    const schedules = getSchedules();
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    const today = getTodayName();
    todayTimeline.innerHTML = "";

    const todaySchedules = schedules
        .filter(s => s.day === today)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    if (todaySchedules.length === 0) {
        todayTimeline.innerHTML = "<p>No schedule for today 🎉</p>";
        if (freeTimeSlotsList) {
            freeTimeSlotsList.innerHTML = "<li>Whole day free</li>";
        }
        return;
    }

    todaySchedules.forEach(s => {
        const subject = subjects.find(sub => sub.id == s.subjectId);

        const div = document.createElement("div");
        div.className = "timeline-item";
        div.innerHTML = `
            <strong>${s.start} - ${s.end}</strong><br/>
            ${subject ? subject.name : "Unknown Subject"}
        `;

        todayTimeline.appendChild(div);
    });

    renderFreeTimeSlots(todaySchedules);
}

/* ================= FREE TIME ================= */
function renderFreeTimeSlots(todaySchedules) {
    if (!freeTimeSlotsList) return;

    freeTimeSlotsList.innerHTML = "";

    const DAY_START = 8 * 60;
    const DAY_END = 22 * 60;

    let lastEnd = DAY_START;

    todaySchedules.forEach(s => {
        const start = timeToMinutes(s.start);
        const end = timeToMinutes(s.end);

        if (start > lastEnd) {
            freeTimeSlotsList.innerHTML += `
                <li>${minutesToTime(lastEnd)} - ${minutesToTime(start)}</li>
            `;
        }

        lastEnd = Math.max(lastEnd, end);
    });

    if (lastEnd < DAY_END) {
        freeTimeSlotsList.innerHTML += `
            <li>${minutesToTime(lastEnd)} - ${minutesToTime(DAY_END)}</li>
        `;
    }

    if (freeTimeSlotsList.innerHTML === "") {
        freeTimeSlotsList.innerHTML = "<li>No free slots today</li>";
    }
}

/* ================= ADD SCHEDULE ================= */
scheduleForm?.addEventListener("submit", e => {
    e.preventDefault();

    const day = scheduleDaySelect.value;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    const subjectId = document.getElementById("scheduleSubject").value;

    if (!day || !start || !end || start >= end) {
        alert("Invalid time range");
        return;
    }

    const newSchedule = {
        id: Date.now(),
        day,
        start,
        end,
        subjectId
    };

    const schedules = getSchedules();

    if (hasConflict(newSchedule, schedules)) {
        alert("⛔ Time conflict detected!");
        return;
    }

    schedules.push(newSchedule);
    saveSchedules(schedules);
    scheduleForm.reset();

    renderScheduleList();
    renderTodaySchedule();
});

/* ================= DELETE ================= */
function deleteSchedule(id) {
    let schedules = getSchedules();
    schedules = schedules.filter(s => s.id !== id);
    saveSchedules(schedules);

    renderScheduleList();
    renderTodaySchedule();
}

/* ================= INIT ================= */
initScheduleDays();
renderScheduleList();
renderTodaySchedule();

window.addEventListener("plannerDataChanged", () => {
    renderScheduleList();
    renderTodaySchedule();
});
