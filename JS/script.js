const CART_STORAGE_KEY = "sweet-delights-cart";
const ORDER_DRAFT_STORAGE_KEY = "sweet-delights-order-draft";
const CONTACT_DRAFT_STORAGE_KEY = "sweet-delights-contact-draft";
const scriptUrl = document.currentScript?.src;
const siteBaseUrl = scriptUrl
  ? new URL("../", scriptUrl)
  : new URL("./", document.baseURI);

function siteUrl(path) {
  return new URL(String(path).replace(/^\/+/, ""), siteBaseUrl).href;
}


function assetUrl(path) {
  return siteUrl(String(path).replace(/^\.\.\//, ""));
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(cart)) return [];
    return cart
      .filter((item) => item && typeof item.name === "string")
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
    element.hidden = count === 0;
  });
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}
function setupImageFallback(root) {
  root.querySelectorAll("img").forEach((image) =>
    image.addEventListener("error", () => {
      if (image.dataset.fallback) return;
      image.dataset.fallback = "true";
      image.alt = "Image unavailable";
      image.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23fde7df'/%3E%3Ctext x='400' y='310' text-anchor='middle' fill='%237b3f46' font-family='sans-serif' font-size='32'%3EImage unavailable%3C/text%3E%3C/svg%3E";
    }),
  );
}

function priceValue(price) {
  return Number.parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
}
function cartSubtotal(cart = getCart()) {
  return cart.reduce(
    (total, item) => total + priceValue(item.price) * item.quantity,
    0,
  );
}
function formattedPrice(price) {
  return `₱${priceValue(price).toFixed(2)}`;
}
function formattedSubtotal(cart = getCart()) {
  return formattedPrice(cartSubtotal(cart));
}
function isInCart(product) {
  return getCart().some((item) => item.name === product.name);
}
function productCard(product) {
  return `<article class="product-card"><img src="${assetUrl(product.img)}" alt="${escapeHtml(product.name)}" loading="lazy"><div class="product-card__body"><h3>${escapeHtml(product.name)}</h3><p>${formattedPrice(product.price)}</p><button class="btn btn-primary" type="button" data-add-product>Add to cart</button></div></article>`;
}

async function getCakes() {
  const response = await fetch(siteUrl("cakes.json"));
  if (!response.ok) throw new Error("Unable to load cakes.");
  return response.json();
}

function setActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll("header .navbar a").forEach((link) => {
    const linkPath = new URL(
      link.href,
      window.location.href,
    ).pathname.toLowerCase();
    link.classList.toggle(
      "active",
      currentPath === linkPath ||
        (currentPath === "/" && linkPath.endsWith("/index.html")),
    );
  });
}

async function loadComponent(id, file) {
  const target = document.getElementById(id);

  if (!target) {
    console.error(`Element #${id} not found`);
    return;
  }

  try {
    const url = siteUrl(file);
    console.log("Loading:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }

    target.innerHTML = await response.text();

    target.querySelectorAll("[src^='/'], [href^='/']").forEach((element) => {
      ["src", "href"].forEach((attribute) => {
        const value = element.getAttribute(attribute);

        if (value && value.startsWith("/")) {
          element.setAttribute(attribute, siteUrl(value));
        }
      });
    });

    setupImageFallback(target);

    if (id === "header") {
      setActiveNavLink();
    }

    updateCartCount();
  } catch (error) {
    console.error("Component loading error:", error);
    target.innerHTML = "";
  }
}

async function renderCakeMenu() {
  const containers = document.querySelectorAll("[data-category]");
  if (!containers.length) return;
  try {
    const cakes = await getCakes();
    containers.forEach((container) => {
      const products = cakes.filter(
        (cake) => cake.category === container.dataset.category,
      );
      const content =
        container.querySelector("[data-category-content]") || container;
      content.innerHTML = `<div class="product-grid">${products.map(productCard).join("")}</div>`;
      content
        .querySelectorAll("[data-add-product]")
        .forEach((button, index) => {
          configureCartButton(button, products[index]);
          button.addEventListener("click", () =>
            toggleProductInCart(button, products[index]),
          );
        });
      setupImageFallback(content);
    });
  } catch (error) {
    console.error(error);
    containers.forEach((container) => {
      container.textContent = "Our cake menu is temporarily unavailable.";
    });
  }
}

function setupCategoryTabs() {
  const tabs = document.querySelectorAll("[data-category-tab]");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  });
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const category = tab.dataset.categoryTab;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      document.querySelectorAll("[data-category]").forEach((panel) => {
        panel.hidden = panel.dataset.category !== category;
      });
    }),
  );
  tabs.forEach((tab, index) =>
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }),
  );
}

async function setupFeaturedProductButtons() {
  const buttons = document.querySelectorAll("[data-featured-product]");
  if (!buttons.length) return;
  try {
    const cakes = await getCakes();
    buttons.forEach((button) => {
      const product = cakes.find(
        (cake) => cake.name === button.dataset.featuredProduct,
      );
      if (!product) return;
      configureCartButton(button, product);
      button.addEventListener("click", () =>
        toggleProductInCart(button, product),
      );
    });
  } catch (error) {
    console.error(error);
  }
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === product.name);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart(cart);
}

function removeFromCart(product) {
  saveCart(getCart().filter((item) => item.name !== product.name));
}

function configureCartButton(button, product) {
  const selected = isInCart(product);
  button.classList.toggle("is-selected", selected);
  button.setAttribute("aria-pressed", String(selected));
  button.textContent = selected ? "Remove from cart" : "Add to cart";
}

function toggleProductInCart(button, product) {
  if (isInCart(product)) removeFromCart(product);
  else addToCart(product);
  configureCartButton(button, product);
}

async function renderProductDetails() {
  const target = document.getElementById("product-details");
  if (!target) return;
  try {
    const name = new URLSearchParams(window.location.search).get("name");
    const product = (await getCakes()).find((cake) => cake.name === name);
    if (!product) throw new Error("Product not found.");
    target.innerHTML = `<div class="product-detail"><img src="${assetUrl(product.img)}" alt="${escapeHtml(product.name)}"><div><p class="eyebrow">${escapeHtml(product.category)}</p><h1 class="section-title">${escapeHtml(product.name)}</h1><p class="product-price">${formattedPrice(product.price)}</p><p>Made to order with care. Contact us for custom sizing, flavours, and celebration details.</p><button class="btn btn-primary" type="button" data-add-product>Add to cart</button></div></div>`;
    const cartButton = target.querySelector("[data-add-product]");
    setupImageFallback(target);
    configureCartButton(cartButton, product);
    cartButton.addEventListener("click", () =>
      toggleProductInCart(cartButton, product),
    );
  } catch {
    target.innerHTML = `<p class="empty-state">This cake could not be found. <a class="text-link" href="${siteUrl("pages/cakes.html")}">Browse our cakes</a>.</p>`;
  }
}

function renderCart() {
  const target = document.getElementById("cart-items");
  if (!target) return;
  const cart = getCart();
  if (!cart.length) {
    target.innerHTML =
      '<p class="empty-state">Your cart is empty. <a class="text-link" href="/pages/cakes.html">Browse our cakes</a>.</p>';
    return;
  }
  target.innerHTML = `<div class="cart-list">${cart.map((item, index) => `<article class="cart-item"><img src="${assetUrl(item.img)}" alt="${escapeHtml(item.name)}"><div><h2>${escapeHtml(item.name)}</h2><p>${formattedPrice(item.price)}</p></div><label>Quantity <input data-quantity="${index}" type="number" min="1" value="${item.quantity}"></label><button class="text-link" data-remove="${index}" type="button">Remove</button></article>`).join("")}</div><div class="cart-actions"><div class="cart-total"><span>Estimated subtotal</span><strong>${formattedSubtotal(cart)}</strong></div><p>Ready to choose delivery details or request a custom cake?</p><a class="btn btn-primary" href="${siteUrl("pages/order.html")}">Proceed to order</a><a class="btn btn-secondary" href="${siteUrl("pages/cakes.html")}">Add more cakes</a></div>`;
  target.querySelectorAll("[data-quantity]").forEach((input) =>
    input.addEventListener("change", () => {
      const updated = getCart();
      updated[Number(input.dataset.quantity)].quantity = Math.max(
        1,
        Number(input.value) || 1,
      );
      saveCart(updated);
      renderCart();
    }),
  );
  target.querySelectorAll("[data-remove]").forEach((button) =>
    button.addEventListener("click", () => {
      const updated = getCart();
      updated.splice(Number(button.dataset.remove), 1);
      saveCart(updated);
      renderCart();
    }),
  );
  setupImageFallback(target);
}

function populateOrderForm() {
  const form = document.querySelector("form[data-order-form]");
  if (!form) return;
  const cart = getCart();
  const summary = document.getElementById("order-cart-summary");
  const dateInput = form.querySelector("#order-date");
  if (summary) {
    summary.innerHTML = cart.length
      ? `<h2>Your cart</h2><ul>${cart.map((item) => `<li>${item.quantity} x ${escapeHtml(item.name)} <span>${formattedPrice(item.price)}</span></li>`).join("")}</ul><p class="order-subtotal">Estimated subtotal: <strong>${formattedSubtotal(cart)}</strong></p>`
      : "<p>No cakes in your cart yet. You can still submit a custom cake request below.</p>";
  }
  if (dateInput) {
    const today = new Date();
    const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    dateInput.min = minimumDate;
    if (dateInput.value && dateInput.value < minimumDate) dateInput.value = "";
  }
}

function setupForms() {
  document
    .querySelectorAll("form[data-order-form], form[data-contact-form]")
    .forEach((form) =>
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const draft = Object.fromEntries(new FormData(form));
        const isOrder = form.hasAttribute("data-order-form");
        localStorage.setItem(
          isOrder ? ORDER_DRAFT_STORAGE_KEY : CONTACT_DRAFT_STORAGE_KEY,
          JSON.stringify(isOrder ? { ...draft, cart: getCart() } : draft),
        );
        const status = form.querySelector("[role=status]");
        if (status)
          status.textContent = isOrder
            ? "Your order request was saved on this device. Add a bakery email or backend to send it automatically."
            : "Thanks! Your message was saved on this device.";
      }),
    );
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadComponent("header", "/partials/header.html"),
    loadComponent("footer", "/partials/footer.html"),
  ]);
  updateCartCount();
  renderCakeMenu();
  setupCategoryTabs();
  setupFeaturedProductButtons();
  renderProductDetails();
  renderCart();
  populateOrderForm();
  setupForms();
});
