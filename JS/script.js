let menu = document.querySelector("#menu-bars");
let navbar = document.querySelector(".navbar");

// Attach menu only if it exists
if (menu && navbar) {
  menu.onclick = () => {
    menu.classList.toggle("fa-times");
    navbar.classList.toggle("active");
  };

  window.onscroll = () => {
    menu.classList.remove("fa-times");
    navbar.classList.remove("active");
  };
}

// Search form toggle (safe check)
const searchIcon = document.querySelector("#search-icon");
const searchForm = document.querySelector("#search-form");
const closeBtn = document.querySelector("#close");

if (searchIcon && searchForm) {
  searchIcon.onclick = () => searchForm.classList.toggle("active");
}
if (closeBtn && searchForm) {
  closeBtn.onclick = () => searchForm.classList.remove("active");
}

// Scroll-to-top helper
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll("header .navbar a");

  navLinks.forEach((link) => {
    const linkPath = new URL(
      link.href,
      window.location.href,
    ).pathname.toLowerCase();
    const isHome = currentPath === "/" && linkPath.endsWith("/index.html");

    link.classList.toggle("active", currentPath === linkPath || isHome);
  });
}

function isPageTransitionLink(link, event) {
  if (!link || event.defaultPrevented) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (url.origin !== currentUrl.origin) return false;
  if (url.pathname === currentUrl.pathname && url.hash) return false;

  return true;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!isPageTransitionLink(link, event)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  event.preventDefault();
  document.body.classList.add("page-is-leaving");

  window.setTimeout(() => {
    window.location.href = link.href;
  }, 220);
});

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-is-leaving");
});

// Async component loader
async function loadComponent(id, file) {
  try {
    console.log("Loading:", file);
    const res = await fetch(file);
    if (!res.ok)
      throw new Error(`Failed to load ${file} (status: ${res.status})`);
    document.getElementById(id).innerHTML = await res.text();
    if (id === "header") setActiveNavLink();
    console.log(`✅ Loaded ${file} into #${id}`);
  } catch (err) {
    console.error("❌ Error loading component:", err);
  }
}

//Cakes container
document.addEventListener("DOMContentLoaded", () => {
  fetch("/cakes.json")
    .then((res) => res.json())
    .then((data) => {
      // Group cakes by category
      const grouped = data.reduce((acc, cake) => {
        if (!acc[cake.category]) {
          acc[cake.category] = [];
        }
        acc[cake.category].push(cake);
        return acc;
      }, {});

      // Render each category
      Object.entries(grouped).forEach(([category, cakes]) => {
        // Handle cases where category name has spaces ("ice cream", "normal flavors")
        const safeId = category.replace(/\s+/g, "");
        const container = document.getElementById(safeId);

        if (container) {
          container.innerHTML = `
            <div class="product-grid">
              ${cakes
                .map(
                  (cake) => `
                <article class="product-card">
                  <a href="pages/productDetails.html">
                    <img
                      src="${cake.img}"
                      alt="${cake.name}"
                    >
                  </a>

                  <div class="product-card__body">
                    <h3>${cake.name}</h3>
                    <p>${cake.price}</p>
                  </div>
                </article>
              `,
                )
                .join("")}
            </div>
          `;
        }
      });
    })
    .catch((err) => console.error("Error loading cakes:", err));
});

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "/partials/header.html");
  loadComponent("footer", "/partials/footer.html");
});
