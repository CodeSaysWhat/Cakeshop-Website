let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');

// Attach menu only if it exists
if (menu && navbar) {
  menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
  };

  window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
  };
}

// Search form toggle (safe check)
const searchIcon = document.querySelector('#search-icon');
const searchForm = document.querySelector('#search-form');
const closeBtn = document.querySelector('#close');

if (searchIcon && searchForm) {
  searchIcon.onclick = () => searchForm.classList.toggle('active');
}
if (closeBtn && searchForm) {
  closeBtn.onclick = () => searchForm.classList.remove('active');
}

// Scroll-to-top helper
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Async component loader
async function loadComponent(id, file) {
  try {
    console.log("Loading:", file);
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to load ${file} (status: ${res.status})`);
    document.getElementById(id).innerHTML = await res.text();
    console.log(`✅ Loaded ${file} into #${id}`);
  } catch (err) {
    console.error("❌ Error loading component:", err);
  }
}

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "partials/header.html");
  loadComponent("footer", "partials/footer.html");
});