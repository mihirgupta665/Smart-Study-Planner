
console.log("schedule.js loaded");

const scheduleForm = document.getElementById("scheduleForm");
const scheduleList = document.getElementById("scheduleList");

// Get schedules from LocalStorage
function getSchedules() {
    return JSON.parse(localStorage.getItem("schedules")) || [];
}

// Save schedules
function saveSchedules(schedules) {
    localStorage.setItem("schedules", JSON.stringify(schedules));
}

// Check for time conflict
function hasConflict(newSchedule, schedules) {
    return schedules.some(schedule => {
        return (
            schedule.day === newSchedule.day &&
            !(newSchedule.end <= schedule.start || newSchedule.start >= schedule.end)
        );
    });
}

// Render schedules
function renderSchedules() {
    const schedules = getSchedules();
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    scheduleList.innerHTML = "";

    schedules.forEach(schedule => {
        const subject = subjects.find(s => s.id == schedule.subjectId);

        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <strong>${schedule.day}</strong><br/>
            ${schedule.start} - ${schedule.end}<br/>
            ${subject ? subject.name : "Unknown Subject"}
            <br/>
            <button onclick="deleteSchedule(${schedule.id})">❌</button>
        `;
        scheduleList.appendChild(div);
    });

    // Dashboard update
    document.getElementById("todaySchedule").textContent =
        schedules.filter(s => s.day === new Date().toLocaleDateString("en-US", { weekday: "long" })).length
        || "No schedule";
}

// Add schedule
scheduleForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const day = document.getElementById("scheduleDay").value;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    const subjectId = document.getElementById("scheduleSubject").value;

    if (!start || !end || start >= end) {
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
        alert("Time conflict detected! Choose another slot.");
        return;
    }

    schedules.push(newSchedule);
    saveSchedules(schedules);
    scheduleForm.reset();
    renderSchedules();
});

// Delete schedule
function deleteSchedule(id) {
    let schedules = getSchedules();
    schedules = schedules.filter(s => s.id !== id);
    saveSchedules(schedules);
    renderSchedules();
}

// Initial render
renderSchedules();
