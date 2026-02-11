console.log("analytics.js loaded");

/* ================= MAIN ================= */
function renderAnalytics() {
    const analyticsContainer = document.getElementById("analyticsContainer");
    const subjectCanvas = document.getElementById("subjectChart");
    const taskStatusCanvas = document.getElementById("taskStatusChart");
    const weeklyTaskCanvas = document.getElementById("weeklyTaskChart");
    const legendContainer = document.getElementById("chartLegend");
    const subjectLoadContainer = document.getElementById("subjectLoadContainer");

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    if (analyticsContainer) {
        renderTaskCompletionStats(analyticsContainer, tasks);
    }

    renderSubjectChart(subjectCanvas, legendContainer, subjectLoadContainer, subjects);
    renderTaskStatusChart(taskStatusCanvas, tasks);
    renderWeeklyTaskTrend(weeklyTaskCanvas, tasks);
}

/* ================= TASK COMPLETION ================= */
function renderTaskCompletionStats(container, tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    container.innerHTML = `
        <h3>Task Completion Overview</h3>
        <p><strong>${percent}%</strong> completed</p>

        <div style="background:#e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:1rem;">
            <div style="
                width:${percent}%;
                background:#2563eb;
                color:white;
                padding:4px;
                text-align:center;
            ">
                ${percent}%
            </div>
        </div>

        <p>Completed: ${completed}</p>
        <p>Pending: ${pending}</p>
    `;
}

/* ================= SUBJECT STUDY DONUT ================= */
function renderSubjectChart(canvas, legendContainer, loadContainer, subjects) {
    if (!canvas || !legendContainer || !loadContainer) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    legendContainer.innerHTML = "";
    loadContainer.innerHTML = "";

    if (subjects.length === 0) return;

    const totalHours = subjects.reduce((s, sub) => s + Number(sub.hours || 0), 0);
    if (totalHours === 0) return;

    const colors = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea"];
    let startAngle = 0;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerR = 110;
    const innerR = 55;

    subjects.forEach((sub, i) => {
        const slice = (sub.hours / totalHours) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
        ctx.arc(cx, cy, innerR, startAngle + slice, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        startAngle += slice;

        const legend = document.createElement("div");
        legend.className = "legend-item";
        legend.style.display = "flex";
        legend.style.alignItems = "center";
        legend.style.marginBottom = "6px";

        legend.innerHTML = `
            <span style="
                width:14px;height:14px;
                background:${colors[i % colors.length]};
                border-radius:3px;
                display:inline-block;
                margin-right:8px;
            "></span>
            ${sub.name} (${sub.hours} hrs/week)
        `;
        legendContainer.appendChild(legend);

        loadContainer.innerHTML += `
            <div style="margin-bottom:0.6rem;">
                <strong>${sub.name}</strong>
                <div style="background:#e5e7eb;border-radius:6px;overflow:hidden;">
                    <div style="
                        width:${Math.min(sub.hours * 10, 100)}%;
                        background:#16a34a;
                        color:white;
                        padding:3px;
                    ">
                        ${sub.hours} hrs/week
                    </div>
                </div>
            </div>
        `;
    });

    ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Weekly Study", cx, cy - 5);
    ctx.fillText("Distribution", cx, cy + 12);
}

/* ================= TASK STATUS PIE ================= */
function renderTaskStatusChart(canvas, tasks) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = tasks.length - completed;
    const total = completed + pending || 1;

    const data = [
        { value: completed, color: "#16a34a" },
        { value: pending, color: "#dc2626" }
    ];

    let angle = 0;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 100;

    data.forEach(d => {
        const slice = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, angle + slice);
        ctx.fillStyle = d.color;
        ctx.fill();
        angle += slice;
    });

    ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#000";
    ctx.textAlign = "center";
    ctx.font = "14px Arial";
    ctx.fillText("Task Status", cx, cy);
}

/* ================= WEEKLY TASK TREND ================= */
function renderWeeklyTaskTrend(canvas, tasks) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);

    tasks.forEach(task => {
        const date = task.createdAt
            ? new Date(task.createdAt)
            : new Date(task.deadline);

        if (isNaN(date)) return;
        counts[date.getDay()]++;
    });

    const max = Math.max(...counts, 1);
    const barWidth = 36;
    const gap = 18;
    const baseY = canvas.height - 30;

    counts.forEach((val, i) => {
        const height = (val / max) * 150;
        const x = i * (barWidth + gap) + 30;

        ctx.fillStyle = "#2563eb";
        ctx.fillRect(x, baseY - height, barWidth, height);

        ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#000";
        ctx.textAlign = "center";
        ctx.fillText(days[i], x + barWidth / 2, baseY + 14);
        ctx.fillText(val, x + barWidth / 2, baseY - height - 6);
    });

    ctx.fillText("Tasks per Day", canvas.width / 2, 16);
}

/* ================= INIT ================= */
renderAnalytics();
window.addEventListener("storage", renderAnalytics);
window.addEventListener("plannerDataChanged", renderAnalytics);
