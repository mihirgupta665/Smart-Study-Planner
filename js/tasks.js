
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

// Get tasks
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Save tasks
function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
    const tasks = getTasks();
    taskList.innerHTML = "";

    let pendingCount = 0;

    tasks.forEach(task => {
        const li = document.createElement("li");

        const isOverdue =
            task.status === "Pending" &&
            new Date(task.deadline) < new Date();

        if (task.status === "Pending") pendingCount++;

        li.innerHTML = `
            <span>
                <strong>${task.title}</strong> (${task.type})<br/>
                Deadline: ${task.deadline}
            </span>

            <div>
                <button onclick="toggleTaskStatus(${task.id})">
                    ${task.status === "Pending" ? "✔" : "↩"}
                </button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        if (isOverdue) {
            li.style.borderLeft = "4px solid red";
        }

        taskList.appendChild(li);
    });

    // Update dashboard
    document.getElementById("pendingTasks").textContent = pendingCount;
}

// Add task
taskForm.addEventListener("submit", function (e) {
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
        status: "Pending"
    });

    saveTasks(tasks);
    taskForm.reset();
    renderTasks();
});

// Toggle status
function toggleTaskStatus(id) {
    const tasks = getTasks();
    tasks.forEach(task => {
        if (task.id === id) {
            task.status = task.status === "Pending" ? "Completed" : "Pending";
        }
    });
    saveTasks(tasks);
    renderTasks();
}

// Delete task
function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    saveTasks(tasks);
    renderTasks();
}

// Initial render
renderTasks();
