
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".navbar li");
    const sections = document.querySelectorAll(".section");

    navItems.forEach(item => {
        item.addEventListener("click", () => {

            // Remove active state from nav
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            // Hide all sections
            sections.forEach(section => section.classList.remove("active"));

            // Show selected section
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // Default active tab
    navItems[0].classList.add("active");
});
