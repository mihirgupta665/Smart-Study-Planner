
function renderAnalytics() {
    const analyticsContainer = document.getElementById("analyticsContainer");
    const subjectLoadContainer = document.getElementById("subjectLoadContainer");
    const canvas = document.getElementById("subjectChart");
    const legendContainer = document.getElementById("chartLegend");

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];


    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const pendingTasks = totalTasks - completedTasks;

    const completionPercent =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    analyticsContainer.innerHTML = `
        <h3>Task Completion</h3>
        <p><strong>${completionPercent}%</strong> completed</p>

        <div style="background:#e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:1rem;">
            <div style="
                width:${completionPercent}%;
                background:#2563eb;
                color:white;
                padding:4px;
                text-align:center;
            ">
                ${completionPercent}%
            </div>
        </div>

        <p>Completed: ${completedTasks}</p>
        <p>Pending: ${pendingTasks}</p>

        <hr style="margin:1.5rem 0"/>
        <h3>Weekly Study Time Distribution</h3>
    `;


    if (!canvas || subjects.length === 0) {
        subjectLoadContainer.innerHTML = "";
        return;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    legendContainer.innerHTML = "";

    const totalHours = subjects.reduce(
        (sum, s) => sum + Number(s.hours || 0), 0
    );

    if (totalHours === 0) {
        subjectLoadContainer.innerHTML = "";
        return;
    }

    const colors = [
        "#2563eb", // blue
        "#16a34a", // green
        "#dc2626", // red
        "#ca8a04", // orange
        "#9333ea", // purple
        "#0891b2"  // teal
    ];

    let startAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 120;
    const innerRadius = 60;

    subjects.forEach((subject, index) => {
        const sliceAngle = (subject.hours / totalHours) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        startAngle += sliceAngle;

        // Legend
        const legendItem = document.createElement("div");
        legendItem.style.display = "flex";
        legendItem.style.alignItems = "center";
        legendItem.style.marginBottom = "8px";

        const colorBox = document.createElement("span");
        colorBox.style.width = "14px";
        colorBox.style.height = "14px";
        colorBox.style.backgroundColor = colors[index % colors.length];
        colorBox.style.marginRight = "8px";
        colorBox.style.borderRadius = "3px";

        const label = document.createElement("span");
        label.textContent = `${subject.name} (${subject.hours} hrs/week)`;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });

    // Center text
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Weekly Study", centerX, centerY - 5);
    ctx.fillText("Distribution", centerX, centerY + 12);


    subjectLoadContainer.innerHTML = `
        <hr style="margin:1.5rem 0"/>
        <h3>Subject Load Overview</h3>
    `;

    subjects.forEach(subject => {
        subjectLoadContainer.innerHTML += `
            <div style="margin-bottom:0.7rem;">
                <strong>${subject.name}</strong>
                <div style="background:#e5e7eb; border-radius:6px; overflow:hidden;">
                    <div style="
                        width:${Math.min(subject.hours * 10, 100)}%;
                        background:#16a34a;
                        color:white;
                        padding:3px;
                    ">
                        ${subject.hours} hrs/week
                    </div>
                </div>
            </div>
        `;
    });
}

// Initial render
renderAnalytics();

// Re-render when LocalStorage changes
window.addEventListener("storage", renderAnalytics);
