
const subjectForm = document.getElementById("subjectForm");
const subjectList = document.getElementById("subjectList");
const scheduleSubjectSelect = document.getElementById("scheduleSubject");

// Fetch subjects from LocalStorage
function getSubjects() {
    return JSON.parse(localStorage.getItem("subjects")) || [];
}

// Save subjects to LocalStorage
function saveSubjects(subjects) {
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

// Render subjects on UI
function renderSubjects() {
    const subjects = getSubjects();
    subjectList.innerHTML = "";
    scheduleSubjectSelect.innerHTML = "";

    subjects.forEach(subject => {
        // Subject list
        const li = document.createElement("li");
        li.innerHTML = `
            <span>
                <strong>${subject.name}</strong> 
                (${subject.priority}) - ${subject.hours} hrs/week
            </span>
            <button onclick="deleteSubject(${subject.id})">❌</button>
        `;
        subjectList.appendChild(li);

        // Schedule dropdown
        const option = document.createElement("option");
        option.value = subject.id;
        option.textContent = subject.name;
        scheduleSubjectSelect.appendChild(option);
    });

    // Update dashboard count
    document.getElementById("totalSubjects").textContent = subjects.length;
}

// Add new subject
subjectForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("subjectName").value.trim();
    const priority = document.getElementById("subjectPriority").value;
    const hours = document.getElementById("weeklyHours").value || 0;

    if (!name) return;

    const subjects = getSubjects();

    subjects.push({
        id: Date.now(),
        name,
        priority,
        hours
    });

    saveSubjects(subjects);
    subjectForm.reset();
    renderSubjects();
});

// Delete subject
function deleteSubject(id) {
    let subjects = getSubjects();
    subjects = subjects.filter(subject => subject.id !== id);
    saveSubjects(subjects);
    renderSubjects();
}

// Initial render
renderSubjects();
