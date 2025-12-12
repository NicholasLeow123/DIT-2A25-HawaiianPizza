const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const profileView = document.getElementById('profileView');

const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

function setToken(token) { localStorage.setItem('token', token); }
function getToken() { return localStorage.getItem('token'); }
function removeToken() { localStorage.removeItem('token'); }

if (showRegisterBtn) {
  showRegisterBtn.onclick = () => showView(registerView);
}

if (showLoginBtn) {
  showLoginBtn.onclick = () => showView(loginView);
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    removeToken();
    showView(loginView);
  };
}

// ====== CONFIG ======
const API_BASE_URL = 'http://localhost:3000'; // backend origin

// --------- Simple "store" using localStorage (for compare & cart ONLY for now) ---------

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

// --------- NAV HIGHLIGHTING ---------

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

// --------- COMPARE BAR UI ---------

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
}
function closeCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  if (!backdrop) return;
  backdrop.style.display = "none";
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const address = document.getElementById('regAddress').value;

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name,email,password,address})
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      loadProfile();
    } else { alert(data.error); }
  } catch(err){ console.error(err); alert('Error registering'); }
}
}

function closeCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  if (!backdrop) return;
  backdrop.style.display = "none";
}

async function login() {
  const name = document.getElementById('loginName').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name,password})
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      loadProfile();
    } else { alert(data.error); }
  } catch(err){ console.error(err); alert('Error logging in'); }
}

async function loadProfile() {
  const token = getToken();
  if (!token) return showView(loginView);
  try {
    const res = await fetch('http://localhost:3000/user', { headers:{'Authorization':'Bearer '+token}});
    const data = await res.json();
    if (res.ok) {
      document.getElementById('profileName').value = data.name;
      document.getElementById('profileEmail').value = data.email;
      document.getElementById('profileAddress').value = data.address;
      showView(profileView);
    } else { showView(loginView); }
  } catch(err){ console.error(err); showView(loginView); }
}

async function updateProfile() {
  const token = getToken();
  const name = document.getElementById('profileName').value;
  const email = document.getElementById('profileEmail').value;
  const address = document.getElementById('profileAddress').value;

  try {
    const res = await fetch('http://localhost:3000/user', {
      method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify({name,email,address})
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert('Profile updated!');
    loadProfile();
  } catch(err){ console.error(err); alert('Error updating profile'); }
}
// --------- CART (front-end stub for now) ---------

function addToCartFromCard(cardEl) {
  const id = cardEl.dataset.productId;
  const name = cardEl.dataset.productName;
  const type = cardEl.dataset.productType || "Car";
  const priceDisplay = cardEl.dataset.productPriceDisplay || "";

  if (!id || !name) return;

  let items = getCartItems();
  items.push({ id, name, type, priceDisplay });
  setCartItems(items);

  // For now just show a simple message – backend cart can replace this later
  alert(`Added to cart: ${name}. Cart integration will be handled by the backend.`);
}

//Carousel
function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  const prevBtn = carousel.querySelector("[data-hero-prev]");
  const nextBtn = carousel.querySelector("[data-hero-next]");

  if (!slides.length || slides.length !== dots.length) return;

  let currentIndex = 0;
  let timerId = null;
  const AUTO_ROTATE_MS = 6000;

  function setActive(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
      setActive(currentIndex + 1);
    }, AUTO_ROTATE_MS);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActive(index);
      startTimer();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      setActive(currentIndex - 1);
      startTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      setActive(currentIndex + 1);
      startTimer();
    });
  }

  carousel.addEventListener("mouseenter", stopTimer);
  carousel.addEventListener("mouseleave", startTimer);

  // Initialize
  setActive(0);
  startTimer();
}



// Page wiring
// --------- DYNAMIC CARS LOADING ---------

async function fetchCars() {
  const res = await fetch(`${API_BASE_URL}/cars`);
  if (!res.ok) {
    console.error('Failed to fetch cars', res.status);
    return [];
  }
  return res.json();
}

function renderCars(cars) {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  // Clear any hardcoded cards
  grid.innerHTML = '';

  cars.forEach((car) => {
    // Adjust field names if your backend returns different keys
    const id = car.id;
    const name = car.name;
    const type = car.type;
    const power = car.power || '';
    const priceDisplay = car.price_display || car.priceDisplay || '';
    const description = car.description || '';

    const cardHtml = `
      <article
        class="product-card"
        data-product-id="${car.id}"
        data-product-name="${name}"
        data-product-type="${type}"
        data-product-power="${power}"
        data-product-price-display="${priceDisplay}"
      >
        <div class="product-tag">${type}</div>
        <div class="product-name">${name}</div>
        <div class="product-meta">
          ${description}
        </div>
        <div class="product-price-row">
          <span class="product-price">${priceDisplay}</span>
          <span class="text-muted">${power ? `Est. ${power}` : ''}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-ghost" type="button" data-compare-toggle>
            Compare
          </button>
          <button class="btn btn-primary" type="button" data-add-cart>
            Add to Cart
          </button>
        </div>
      </article>
    `;

    grid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// ---- SESSION ID HELPER ----
function getCompareSessionId() {
  let id = localStorage.getItem('compareSessionId');
  if (!id) {
    id = 'cmp_' + Math.random().toString(36).slice(2);
    localStorage.setItem('compareSessionId', id);
  }
  return id;
}

// ---- TOGGLE COMPARE (full stack) ----
async function toggleCompareForCard(cardEl) {
  const sessionId = getCompareSessionId();
  const carId = Number(cardEl.dataset.productId);

  if (!Number.isInteger(carId)) {
    alert("Internal error: invalid car ID on card.");
    console.error("Invalid data-product-id:", cardEl.dataset.productId);
    return;
  }

  const res = await fetch("/api/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId
    },
    body: JSON.stringify({ car_id: carId })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Failed to add car to comparison.");
    return;
  }

  alert("Car added to comparison");
}



// ---- WIRE COMPARE BUTTONS AFTER RENDERING CARDS ----
function wireCardButtons() {
  document.querySelectorAll('[data-compare-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      toggleCompareForCard(card);
    });
  });

  // your existing add-to-cart wiring can remain here too
}

// Wire compare/add-cart buttons for dynamically created cards
function wireCardButtons() {
  document.querySelectorAll("[data-compare-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      toggleCompareForCard(card);
    });
  });

  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      addToCartFromCard(card);
    });
  });
}

// --------- FILTERS (our own wiring so filters work with dynamic cards) ---------

function setupFilters() {
  const pills = document.querySelectorAll('.filters-bar .filter-pill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;

      // Remove active from all pills, add to clicked
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.textContent.trim();
      const products = document.querySelectorAll('.product-grid .product-card');

      if (filter.toLowerCase() === 'all') {
        products.forEach(p => p.style.display = '');
      } else {
        products.forEach(p => {
          const type = p.dataset.productType;
          p.style.display = type === filter ? '' : 'none';
        });
      }
    });
  });
}

// --------- PAGE WIRING ---------

document.addEventListener("DOMContentLoaded", async () => {
  highlightActiveNav();

  // Compare bar / modal actions
  const compareBarButton = document.getElementById("compareNowButton");
  if (compareBarButton) {
    compareBarButton.addEventListener("click", openCompareModal);
  }

  const compareCloseButton = document.getElementById("compareCloseButton");
  if (compareCloseButton) {
    compareCloseButton.addEventListener("click", closeCompareModal);
  }

// Attach event listeners
if (loginBtn) {
  loginBtn.onclick = login;
}

if (registerBtn) {
  registerBtn.onclick = register;
}

if (updateProfileBtn) {
  updateProfileBtn.onclick = updateProfile;
}


  initHeroCarousel();

// Auto-load profile if token exists
document.addEventListener('DOMContentLoaded', loadProfile);
  renderCompareBar();

  if (loginBtn) {
  loginBtn.onclick = login;
}

if (registerBtn) {
  registerBtn.onclick = register;
}

if (updateProfileBtn) {
  updateProfileBtn.onclick = updateProfile;
}

  // 🔥 Load cars from backend + render cards
// -------- PAGE CHECK (VERY IMPORTANT) --------
const currentPage = window.location.pathname.split("/").pop();

// Only load & render cars on cars.html
if (currentPage === "cars.html") {
  const cars = await fetchCars();
  renderCars(cars);

  // Wire buttons on the newly rendered cards
  wireCardButtons();

  // Setup filters AFTER cards exist
  setupFilters();
}

});

// reset comparison
async function resetComparisonSession() {
  const sessionId = localStorage.getItem("compareSessionId");
  if (!sessionId) return;

  await fetch("/api/compare/reset", {
    method: "DELETE",
    headers: {
      "X-Session-Id": sessionId
    }
  });

  localStorage.removeItem("compareSessionId");
  alert("Comparison cleared. You can select new cars.");
}
