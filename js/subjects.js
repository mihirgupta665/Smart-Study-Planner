console.log("subjects.js loaded");

const subjectForm = document.getElementById("subjectForm");
const subjectList = document.getElementById("subjectList");
const scheduleSubjectSelect = document.getElementById("scheduleSubject");

/* ================= STORAGE ================= */
function getSubjects() {
    return JSON.parse(localStorage.getItem("subjects")) || [];
}

function saveSubjects(subjects) {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    window.dispatchEvent(new Event("plannerDataChanged"));
}

/* ================= HELPERS ================= */
function priorityWeight(priority) {
    return priority === "High" ? 3 : priority === "Medium" ? 2 : 1;
}

function getPendingTasksForSubject(subjectId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    return tasks.filter(
        t => t.subjectId == subjectId && t.status !== "Completed"
    ).length;
}

/* ================= RENDER ================= */
function renderSubjects() {
    const subjects = getSubjects();

    if (subjectList) subjectList.innerHTML = "";
    if (scheduleSubjectSelect) scheduleSubjectSelect.innerHTML = "";

    subjects.forEach(subject => {
        const pendingTasks = getPendingTasksForSubject(subject.id);

        if (subjectList) {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>
                    <strong>${subject.name}</strong>
                    <small>(${subject.priority})</small>
                    • ${subject.hours} hrs/week
                    ${pendingTasks ? `• ⏳ ${pendingTasks} pending` : ""}
                </span>
                <button onclick="deleteSubject(${subject.id})">❌</button>
            `;
            subjectList.appendChild(li);
        }

        if (scheduleSubjectSelect) {
            const option = document.createElement("option");
            option.value = subject.id;
            option.textContent = subject.name;
            scheduleSubjectSelect.appendChild(option);
        }
    });

    updateDashboardSubjects(subjects);
}

/* ================= DASHBOARD ================= */
function updateDashboardSubjects(subjects) {
    const totalEl = document.getElementById("totalSubjects");
    if (totalEl) totalEl.textContent = subjects.length;

    const urgentEl = document.getElementById("urgentSubject");
    if (!urgentEl || subjects.length === 0) {
        if (urgentEl) urgentEl.textContent = "None";
        return;
    }

    let mostUrgent = null;
    let highestScore = -1;

    subjects.forEach(subject => {
        const pending = getPendingTasksForSubject(subject.id);
        const score =
            priorityWeight(subject.priority) * 5 +
            pending * 3 +
            Number(subject.hours || 0);

        if (score > highestScore) {
            highestScore = score;
            mostUrgent = subject;
        }
    });

    urgentEl.textContent = mostUrgent ? mostUrgent.name : "None";
}

/* ================= ADD SUBJECT ================= */
subjectForm?.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const priority = document.getElementById("subjectPriority").value;
    const hours = Number(document.getElementById("weeklyHours").value || 0);

    if (!name) return;

    const subjects = getSubjects();
    subjects.push({
        id: Date.now(),
        name,
        priority,
        hours,
        createdAt: new Date().toISOString()
    });

    saveSubjects(subjects);
    subjectForm.reset();
});

/* ================= DELETE ================= */
function deleteSubject(id) {
    const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const usedInSchedule = schedules.some(s => s.subjectId == id);
    const usedInTasks = tasks.some(t => t.subjectId == id);

    if (usedInSchedule || usedInTasks) {
        const confirmDelete = confirm(
            "This subject is linked to schedules or tasks.\nDelete and clean related data?"
        );
        if (!confirmDelete) return;

        // Clean linked data
        localStorage.setItem(
            "schedules",
            JSON.stringify(schedules.filter(s => s.subjectId != id))
        );
        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks.filter(t => t.subjectId != id))
        );
    }

    const subjects = getSubjects().filter(s => s.id !== id);
    saveSubjects(subjects);
}

/* ================= INIT ================= */
renderSubjects();
window.addEventListener("plannerDataChanged", renderSubjects);
