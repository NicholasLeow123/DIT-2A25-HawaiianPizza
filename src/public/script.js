// --------- Simple "store" using localStorage ---------

const COMPARE_KEY = "nfs_compare_items_v1";
const CART_KEY = "nfs_cart_items_v1";

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Compare helpers
function getCompareItems() {
  return readJson(COMPARE_KEY);
}

function setCompareItems(items) {
  writeJson(COMPARE_KEY, items);
}

// Cart helpers – basic stub
function getCartItems() {
  return readJson(CART_KEY);
}

function setCartItems(items) {
  writeJson(CART_KEY, items);
}

// Nav highlighting

function highlightActiveNav() {
  const links = document.querySelectorAll(".nav-link");
  const current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    if (file === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Compare bar UI

function renderCompareBar() {
  const bar = document.getElementById("compareBar");
  const list = document.getElementById("compareList");
  const items = getCompareItems();

  if (!bar || !list) return;

  if (!items.length) {
    bar.style.display = "none";
    list.innerHTML = "";
    return;
  }

  bar.style.display = "flex";
  list.innerHTML = "";

  items.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "compare-chip";
    chip.textContent = `${item.name} • ${item.type}`;
    list.appendChild(chip);
  });
}

function openCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  const tableBody = document.getElementById("compareTableBody");
  const items = getCompareItems();

  if (!backdrop || !tableBody) return;

  tableBody.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.type}</td>
      <td>${item.power || "-"}</td>
      <td>${item.priceDisplay || "-"}</td>
    `;
    tableBody.appendChild(row);
  });

  backdrop.style.display = items.length ? "flex" : "none";
}

function closeCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  if (backdrop) {
    backdrop.style.display = "none";
  }
}

// Toggle compare for a card
function toggleCompareForCard(cardEl) {
  const id = cardEl.dataset.productId;
  const name = cardEl.dataset.productName;
  const type = cardEl.dataset.productType || "Car";
  const power = cardEl.dataset.productPower || "";
  const priceDisplay = cardEl.dataset.productPriceDisplay || "";

  if (!id || !name) return;

  let items = getCompareItems();
  const existingIndex = items.findIndex((x) => x.id === id);

  if (existingIndex >= 0) {
    items.splice(existingIndex, 1);
  } else {
    items.push({ id, name, type, power, priceDisplay });
  }

  setCompareItems(items);
  renderCompareBar();
}

// Cart (front-end stub)

function addToCartFromCard(cardEl) {
  const id = cardEl.dataset.productId;
  const name = cardEl.dataset.productName;
  const type = cardEl.dataset.productType || "Car";
  const priceDisplay = cardEl.dataset.productPriceDisplay || "";

  if (!id || !name) return;

  let items = getCartItems();
  items.push({ id, name, type, priceDisplay });
  setCartItems(items);

  // For now just show a simple message – backend will wire this up properly later
  alert(`Added to cart: ${name}. Cart integration will be handled by the backend.`);
}

// Page wiring

document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();

  // Wire all "compare" buttons
  document.querySelectorAll("[data-compare-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      toggleCompareForCard(card);
    });
  });

  // Wire all "add to cart" buttons
  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      addToCartFromCard(card);
    });
  });

  // Compare bar / modal actions
  const compareBarButton = document.getElementById("compareNowButton");
  if (compareBarButton) {
    compareBarButton.addEventListener("click", openCompareModal);
  }

  const compareCloseButton = document.getElementById("compareCloseButton");
  if (compareCloseButton) {
    compareCloseButton.addEventListener("click", closeCompareModal);
  }

  const compareBackdrop = document.getElementById("compareBackdrop");
  if (compareBackdrop) {
    compareBackdrop.addEventListener("click", (e) => {
      if (e.target === compareBackdrop) closeCompareModal();
    });
  }

  renderCompareBar();
});
