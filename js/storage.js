document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".navbar li");
    const sections = document.querySelectorAll(".section");

    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    // ================= SECTION SWITCHING =================
    navItems.forEach(item => {
        item.addEventListener("click", () => {

            // Remove active state from nav items
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            // Hide all sections
            sections.forEach(section => section.classList.remove("active"));

            // Show selected section
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");

            // Close mobile menu after click
            if (navLinks) {
                navLinks.classList.remove("show");
            }
        });
    });

    // Default active tab
    if (navItems.length > 0) {
        navItems[0].classList.add("active");
    }

    // ================= MOBILE NAV TOGGLE =================
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }
});
