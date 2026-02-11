console.log("tasks.js loaded");

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskBadge = document.getElementById("taskBadge");

/* ================= STORAGE ================= */
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("plannerDataChanged"));
}

/* ================= DATE HELPERS ================= */
function normalizeDate(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isToday(dateStr) {
    return normalizeDate(dateStr).getTime() === normalizeDate(new Date()).getTime();
}

function isOverdue(task) {
    return (
        task.status === "Pending" &&
        normalizeDate(task.deadline) < normalizeDate(new Date())
    );
}

/* ================= RENDER TASK LIST ================= */
function renderTasks() {
    const tasks = getTasks();
    if (!taskList) return;

    taskList.innerHTML = "";

    let pendingCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.status === "Pending") pendingCount++;
        else completedCount++;

        const li = document.createElement("li");
        const overdue = isOverdue(task);

        li.innerHTML = `
            <span>
                <strong>${task.title}</strong> (${task.type})<br/>
                Deadline: ${task.deadline}
                ${overdue ? "<span style='color:red;'> • Overdue</span>" : ""}
            </span>

            <div>
                <button onclick="toggleTaskStatus(${task.id})">
                    ${task.status === "Pending" ? "✔" : "↩"}
                </button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        if (overdue) {
            li.style.borderLeft = "4px solid red";
        } else if (task.status === "Completed") {
            li.style.opacity = "0.6";
        }

        taskList.appendChild(li);
    });

    updateTaskBadge(pendingCount);
    updateDashboardTasks(tasks, pendingCount, completedCount);
}

/* ================= NAV BADGE ================= */
function updateTaskBadge(pendingCount) {
    if (taskBadge) {
        taskBadge.textContent = pendingCount;
        taskBadge.style.display = pendingCount ? "inline-block" : "none";
    }
}

/* ================= DASHBOARD UPDATES ================= */
function updateDashboardTasks(tasks, pendingCount, completedCount) {
    const pendingEl = document.getElementById("pendingTasks");
    if (pendingEl) pendingEl.textContent = pendingCount;

    updateNextUpcomingTask(tasks);
    updateTodayTasks(tasks);
    updateCompletionRate(tasks, completedCount);
}

/* ================= NEXT UPCOMING TASK ================= */
function updateNextUpcomingTask(tasks) {
    const nextTitle = document.getElementById("nextTaskTitle");
    const nextDeadline = document.getElementById("nextTaskDeadline");
    if (!nextTitle || !nextDeadline) return;

    const upcoming = tasks
        .filter(t => t.status === "Pending")
        .sort((a, b) => normalizeDate(a.deadline) - normalizeDate(b.deadline))[0];

    if (!upcoming) {
        nextTitle.textContent = "No upcoming task 🎉";
        nextDeadline.textContent = "";
        return;
    }

    nextTitle.textContent = upcoming.title;
    nextDeadline.textContent = `Due: ${upcoming.deadline}`;
}

/* ================= TODAY TASKS ================= */
function updateTodayTasks(tasks) {
    const todayList = document.getElementById("todayTaskList");
    if (!todayList) return;

    todayList.innerHTML = "";

    const todayTasks = tasks.filter(
        t => t.status === "Pending" && isToday(t.deadline)
    );

    if (todayTasks.length === 0) {
        todayList.innerHTML = "<li>No tasks for today 🎉</li>";
        return;
    }

    todayTasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task.title;
        todayList.appendChild(li);
    });
}

/* ================= COMPLETION RATE ================= */
function updateCompletionRate(tasks, completedCount) {
    const rateEl = document.getElementById("completionRate");
    const progressEl = document.getElementById("completionProgress");
    if (!rateEl || !progressEl) return;

    const total = tasks.length || 1;
    const percent = Math.round((completedCount / total) * 100);

    rateEl.textContent = `${percent}%`;
    progressEl.style.width = `${percent}%`;
}

/* ================= ADD TASK ================= */
taskForm?.addEventListener("submit", e => {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const type = document.getElementById("taskType").value;
    const deadline = document.getElementById("taskDeadline").value;

    if (!title || !deadline) return;

    const tasks = getTasks();
    tasks.push({
        id: Date.now(),
        title,
        type,
        deadline,
        status: "Pending",
        createdAt: new Date().toISOString(),
        completedAt: null
    });

    saveTasks(tasks);
    taskForm.reset();
});

/* ================= TOGGLE STATUS ================= */
function toggleTaskStatus(id) {
    const tasks = getTasks();

    tasks.forEach(task => {
        if (task.id === id) {
            if (task.status === "Pending") {
                task.status = "Completed";
                task.completedAt = new Date().toISOString();
            } else {
                task.status = "Pending";
                task.completedAt = null;
            }
        }
    });

    saveTasks(tasks);
}

/* ================= DELETE ================= */
function deleteTask(id) {
    const tasks = getTasks().filter(task => task.id !== id);
    saveTasks(tasks);
}

/* ================= INIT ================= */
renderTasks();
window.addEventListener("plannerDataChanged", renderTasks);
