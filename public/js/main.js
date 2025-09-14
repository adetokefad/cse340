// public/js/menu.js

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  toggleBtn.addEventListener("click", () => {
    // Toggle show/hide nav
    if (nav.style.display === "block") {
      nav.style.display = "none";
    } else {
      nav.style.display = "block";
    }
  });
});
